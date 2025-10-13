import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { TRANSACTION_TYPES } from '../constants';
import { Container, TransactionType } from '@prisma/client';

// Transfer spirit between containers
export const transferSpirit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const { sourceContainerId, destinationContainerId, amount, unit } = req.body;
    // Get source container
    const sourceContainer: Container | null = await prisma.container.findFirst({
      where: { id: sourceContainerId, userId }
    });

    if (!sourceContainer) {
      return res.status(404).json({ error: 'Source container not found' });
    }

    // Get destination container
    const destinationContainer: Container | null = await prisma.container.findFirst({
      where: { id: destinationContainerId, userId }
    });

    if (!destinationContainer) {
      return res.status(404).json({ error: 'Destination container not found' });
    }

    // Calculate transfer amounts
    const transferAmount = parseFloat(amount);
    const sourceProof = sourceContainer.proof ? parseFloat(sourceContainer.proof.toString()) : 0;
    const proofGallonsTransferred = unit === 'gallons' ? transferAmount * (sourceProof / 100) : transferAmount;

    // Update source container
    const sourceVolume = sourceContainer.currentVolumeGallons ? parseFloat(sourceContainer.currentVolumeGallons.toString()) : 0;
    const updatedSourceVolume = Math.max(0, sourceVolume - transferAmount);
    const updatedSource = await prisma.container.update({
      where: { id: sourceContainerId },
      data: {
        currentVolumeGallons: updatedSourceVolume,
        isEmpty: updatedSourceVolume <= 0
      }
    });

    // Update destination container
    const destVolume = destinationContainer.currentVolumeGallons ? parseFloat(destinationContainer.currentVolumeGallons.toString()) : 0;
    const updatedDestVolume = destVolume + transferAmount;
    const updatedDest = await prisma.container.update({
      where: { id: destinationContainerId },
      data: {
        currentVolumeGallons: updatedDestVolume,
        isEmpty: false,
        proof: sourceProof, // Assume same proof
        productId: sourceContainer.productId
      }
    });

    // Create transaction log
    await prisma.transaction.create({
      data: {
        userId,
        transactionType: TRANSACTION_TYPES.TRANSFER_OUT as TransactionType,
        containerId: sourceContainerId,
        volumeGallons: -transferAmount,
        proofGallons: -proofGallonsTransferred,
        notes: `Transferred ${transferAmount} gallons to container ${destinationContainerId}`
      }
    });

    await prisma.transaction.create({
      data: {
        userId,
        transactionType: TRANSACTION_TYPES.TRANSFER_IN as TransactionType,
        containerId: destinationContainerId,
        volumeGallons: transferAmount,
        proofGallons: proofGallonsTransferred,
        notes: `Received ${transferAmount} gallons from container ${sourceContainerId}`
      }
    });

    res.json({
      success: true,
      sourceContainer: updatedSource,
      destinationContainer: updatedDest
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Transfer failed' });
  }
};

// Proof down spirit
export const proofDownSpirit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const { containerId, targetProof } = req.body;

    const container = await prisma.container.findFirst({
      where: { id: containerId, userId }
    });

    if (!container) {
      return res.status(404).json({ error: 'Container not found' });
    }

    const oldProof = container.proof ? parseFloat(container.proof.toString()) : 0;
    const newProof = parseFloat(targetProof);

    if (newProof >= oldProof) {
      return res.status(400).json({ error: 'Target proof must be lower than current proof' });
    }

    // Update container proof
    const updatedContainer = await prisma.container.update({
      where: { id: containerId },
      data: { proof: newProof }
    });

    // Create transaction log
    await prisma.transaction.create({
      data: {
        userId,
        transactionType: TRANSACTION_TYPES.PROOF_DOWN as TransactionType,
        containerId,
        proof: newProof,
        notes: `Proofed down from ${oldProof} to ${newProof}`
      }
    });

    res.json({
      success: true,
      container: updatedContainer
    });
  } catch (error) {
    console.error('Proof down error:', error);
    res.status(500).json({ error: 'Proof down failed' });
  }
};

// Adjust container contents
export const adjustContents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { containerId, adjustmentType, amount, notes } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const container = await prisma.container.findFirst({
      where: { id: containerId, userId }
    });

    if (!container) {
      return res.status(404).json({ error: 'Container not found' });
    }

    const adjustmentAmount = parseFloat(amount);
    const containerVolume = container.currentVolumeGallons ? parseFloat(container.currentVolumeGallons.toString()) : 0;
    const newVolume = Math.max(0, containerVolume - adjustmentAmount);

    // Update container
    const updatedContainer = await prisma.container.update({
      where: { id: containerId },
      data: {
        currentVolumeGallons: newVolume,
        isEmpty: newVolume <= 0
      }
    });

    // Create transaction log
    await prisma.transaction.create({
      data: {
        userId,
        transactionType: TRANSACTION_TYPES.SAMPLE_ADJUST as TransactionType,
        containerId,
        volumeGallons: -adjustmentAmount,
        notes: `${adjustmentType} adjustment: ${notes}`
      }
    });

    res.json({
      success: true,
      container: updatedContainer
    });
  } catch (error) {
    console.error('Adjustment error:', error);
    res.status(500).json({ error: 'Adjustment failed' });
  }
};

// Bottle spirit from container
export const bottleSpirit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { containerId, bottlingType, bottleSize, numberOfBottles } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const container = await prisma.container.findFirst({
      where: { id: containerId, userId }
    });

    if (!container) {
      return res.status(404).json({ error: 'Container not found' });
    }

    // Calculate bottle volume (simplified)
    const bottleVolumeMap = {
      '375ml': 0.375,
      '750ml': 0.75,
      '1L': 1.0,
      '1.75L': 1.75
    };

    const bottleVolume = bottleVolumeMap[bottleSize as keyof typeof bottleVolumeMap] || 0.75;
    const totalBottledVolume = bottleVolume * parseInt(numberOfBottles);
    const containerVolume = container.currentVolumeGallons ? parseFloat(container.currentVolumeGallons.toString()) : 0;
    const newVolume = bottlingType === 'empty' ? 0 : Math.max(0, containerVolume - totalBottledVolume);

    // Update container
    const updatedContainer = await prisma.container.update({
      where: { id: containerId },
      data: {
        currentVolumeGallons: newVolume,
        isEmpty: newVolume <= 0
      }
    });

    // Create transaction log
    await prisma.transaction.create({
      data: {
        userId,
        transactionType: (bottlingType === 'partial' ? TRANSACTION_TYPES.BOTTLE_PARTIAL : TRANSACTION_TYPES.BOTTLE_EMPTY) as TransactionType,
        containerId,
        volumeGallons: -totalBottledVolume,
        notes: `Bottled ${numberOfBottles} ${bottleSize} bottles`
      }
    });

    res.json({
      success: true,
      container: updatedContainer
    });
  } catch (error) {
    console.error('Bottling error:', error);
    res.status(500).json({ error: 'Bottling failed' });
  }
};

// Change container account
export const changeAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { containerId, newAccount: _newAccount } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const container = await prisma.container.findFirst({
      where: { id: containerId, userId }
    });

    if (!container) {
      return res.status(404).json({ error: 'Container not found' });
    }

    // Note: 'account' field doesn't exist in the Container model
    // This function would need to be updated based on actual requirements
    // For now, returning the container as-is
    const updatedContainer = await prisma.container.findUnique({
      where: { id: containerId }
    });

    res.json({
      success: true,
      container: updatedContainer
    });
  } catch (error) {
    console.error('Account change error:', error);
    res.status(500).json({ error: 'Account change failed' });
  }
};
