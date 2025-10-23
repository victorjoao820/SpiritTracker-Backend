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
    const sourceNetWeight = sourceContainer.netWeight ? parseFloat(sourceContainer.netWeight.toString()) : 0;
    const updatedSourceNetWeight = Math.max(0, sourceNetWeight - (transferAmount * 8.3)); // Convert gallons to lbs
    const updatedSource = await prisma.container.update({
      where: { id: sourceContainerId },
      data: {
        netWeight: updatedSourceNetWeight,
        status: updatedSourceNetWeight <= 0 ? 'EMPTY' : 'FILLED'
      }
    });

    // Update destination container
    const destNetWeight = destinationContainer.netWeight ? parseFloat(destinationContainer.netWeight.toString()) : 0;
    const updatedDestNetWeight = destNetWeight + (transferAmount * 8.3); // Convert gallons to lbs
    const updatedDest = await prisma.container.update({
      where: { id: destinationContainerId },
      data: {
        netWeight: updatedDestNetWeight,
        status: 'FILLED',
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
    const { containerId, targetProof, finalWineGallons } = req.body;

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

    // Calculate new net weight from final wine gallons
    const newNetWeight = finalWineGallons ? parseFloat(finalWineGallons) * 8.3 : container.netWeight;

    // Update container with new values
    const updatedContainer = await prisma.container.update({
      where: { id: containerId },
      data: { 
        proof: newProof,
        netWeight: newNetWeight
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
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
    const containerNetWeight = container.netWeight ? parseFloat(container.netWeight.toString()) : 0;
    const newNetWeight = Math.max(0, containerNetWeight - (adjustmentAmount * 8.3)); // Convert gallons to lbs

    // Update container
    const updatedContainer = await prisma.container.update({
      where: { id: containerId },
      data: {
        netWeight: newNetWeight,
        status: newNetWeight <= 0 ? 'EMPTY' : 'FILLED'
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
    const containerNetWeight = container.netWeight ? parseFloat(container.netWeight.toString()) : 0;
    const newNetWeight = bottlingType === 'empty' ? 0 : Math.max(0, containerNetWeight - (totalBottledVolume * 8.3)); // Convert gallons to lbs

    // Update container
    const updatedContainer = await prisma.container.update({
      where: { id: containerId },
      data: {
        netWeight: newNetWeight,
        status: newNetWeight <= 0 ? 'EMPTY' : 'FILLED'
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
    const { containerId, newAccount } = req.body;
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

    // Update container account
    const updatedContainer = await prisma.container.update({
      where: { id: containerId },
      data: {
        account: newAccount
      }
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
