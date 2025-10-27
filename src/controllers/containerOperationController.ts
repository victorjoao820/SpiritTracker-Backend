import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { TRANSACTION_TYPES, CONTAINER_CAPACITIES_GALLONS } from '../constants';
import { Container, TransactionType } from '@prisma/client';

// Helper function to calculate spirit density (simplified for validation)
const calculateSpiritDensity = (proof: number): number => {
  // Simplified density calculation
  const WATER_DENSITY = 8.328; // lbs per gallon at 60°F
  const ETHANOL_DENSITY = 6.61; // lbs per gallon at 60°F
  
  if (proof <= 0) return WATER_DENSITY;
  
  // Linear interpolation between water and ethanol densities
  const ethanolFraction = proof / 200; // Convert proof to fraction
  return (ethanolFraction * ETHANOL_DENSITY) + ((1 - ethanolFraction) * WATER_DENSITY);
};


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
    const { sourceContainerId, destinationContainerId, transferAll, amount, transAmountWG } = req.body;
    //Unit == Lbs//
    // const { sourceContainerId, destinationContainerId, amount, transferAll, transferUnit } = req.body;
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

    // Validate destination container capacity
    if (destinationContainer.type) {
      const destinationCapacity = CONTAINER_CAPACITIES_GALLONS[destinationContainer.type] || 0;
      
      if (destinationCapacity > 0) {
        // Calculate current wine gallons in destination
        const destNetWeight = destinationContainer.netWeight ? parseFloat(destinationContainer.netWeight.toString()) : 0;
        const destProof = destinationContainer.proof ? parseFloat(destinationContainer.proof.toString()) : 0;
        const destDensity = calculateSpiritDensity(destProof);
        const currentWineGallons = destNetWeight / destDensity;
        
        // Get transfer wine gallons
        const transferWineGallons = parseFloat(transAmountWG);
        
        // Check if transfer exceeds capacity
        const newTotalGallons = currentWineGallons + transferWineGallons;
        
        if (newTotalGallons > destinationCapacity) {
          return res.status(400).json({ 
            error: `Transfer would exceed destination capacity. Current: ${currentWineGallons.toFixed(2)} WG, Transfer: ${transferWineGallons.toFixed(2)} WG, Total: ${newTotalGallons.toFixed(2)} WG, Capacity: ${destinationCapacity.toFixed(2)} WG` 
          });
        }
      }
    }

    // Calculate transfer amounts
    const sourceProof = sourceContainer.proof ? parseFloat(sourceContainer.proof.toString()) : 0;


    const transferAmount = parseFloat(amount);      //Lbs
    const proofGallonsTransferred = parseFloat(transAmountWG) * sourceProof / 100;




    // Update source container
    const sourceNetWeight = sourceContainer.netWeight ? parseFloat(sourceContainer.netWeight.toString()) : 0;
    const updatedSourceNetWeight = Math.max(0, sourceNetWeight - transferAmount ); // Convert gallons to lbs
    const updatedSource = await prisma.container.update({
      where: { id: sourceContainerId },
      data: {
        netWeight: updatedSourceNetWeight,
        status: updatedSourceNetWeight <= 0 ? 'EMPTY' : 'FILLED'
      }
    });

    // Update destination container
    const destNetWeight = destinationContainer.netWeight ? parseFloat(destinationContainer.netWeight.toString()) : 0;
    const destProof = destinationContainer.proof ? parseFloat(destinationContainer.proof.toString()) : 0;
    const updatedDestNetWeight = destNetWeight + transferAmount ; // Convert gallons to lbs
    const newDestProof = (destNetWeight * destProof + transferAmount * sourceProof ) / (destNetWeight + transferAmount); // Calculate new proof

    const updatedDest = await prisma.container.update({
      where: { id: destinationContainerId },
      data: {
        netWeight: updatedDestNetWeight,
        status: 'FILLED',
        proof: newDestProof.toFixed(2), // Assume same proof
        productId: sourceContainer.productId
      }
    });

    // Create transaction log
    await prisma.transaction.create({
      data: {
        userId,
        transactionType: TRANSACTION_TYPES.TRANSFER_OUT as TransactionType,
        containerId: sourceContainerId,
        volumeGallons: -parseFloat(transAmountWG),
        proofGallons: -proofGallonsTransferred,
        notes: `Transferred ${parseFloat(transAmountWG)} WG to container ${destinationContainerId} ${transferAll ? ', All Transferred!!!' : ''}`
      }
    });

    await prisma.transaction.create({
      data: {
        userId,
        transactionType: TRANSACTION_TYPES.TRANSFER_IN as TransactionType,
        containerId: destinationContainerId,
        volumeGallons: parseFloat(transAmountWG),
        proofGallons: proofGallonsTransferred,
        notes: `Received ${parseFloat(transAmountWG)} WG from container ${sourceContainerId} ${transferAll ? ', All Transferred!!!' : ''}`
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

    // Calculate new net weight from final wine gallons
    const newNetWeight = Number(container.netWeight) * oldProof /newProof;

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
    const { containerId, method, amount, wineGallons } = req.body;
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

    // Validate capacity when adding
    if (method === 'add' && container.type) {
      const containerCapacity = CONTAINER_CAPACITIES_GALLONS[container.type] || 0;
      
      if (containerCapacity > 0) {
        const containerProof = container.proof ? parseFloat(container.proof.toString()) : 0;
        const destDensity = calculateSpiritDensity(containerProof);
        const currentWineGallons = containerNetWeight / destDensity;
        
        // Get adjustment wine gallons
        const adjustmentWineGallons = parseFloat(wineGallons);
        
        // Check if adjustment exceeds capacity
        const newTotalGallons = currentWineGallons + adjustmentWineGallons;
        
        if (newTotalGallons > containerCapacity) {
          return res.status(400).json({ 
            error: `Adjustment would exceed container capacity. Current: ${currentWineGallons.toFixed(2)} WG, Adjustment: ${adjustmentWineGallons.toFixed(2)} WG, Total: ${newTotalGallons.toFixed(2)} WG, Capacity: ${containerCapacity.toFixed(2)} WG` 
          });
        }
      }
    }
    const newNetWeight = method === 'add' ? Math.max(0, containerNetWeight + adjustmentAmount) : Math.max(0, containerNetWeight - adjustmentAmount); // Convert gallons to lbs

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
        volumeGallons: method === 'add' ? wineGallons : -wineGallons,
        notes: `${method} adjustment: ${wineGallons} WG are ${method} from container!`
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
    const { containerId, bottleSize, numberOfBottles, remainderAction, remainderLbs } = req.body;
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
      '375': 0.375,
      '750': 0.75,
      '1000': 1.0,
      '1750': 1.75,
      '50': 0.05
    };
    const bottleNameMap = {
      '375': '375mL',
      '750': '750mL',
      '1000': '1L',
      '1750': '1.75L',
      '50': '50mL'
    }
    const bottleVolume = bottleVolumeMap[bottleSize as keyof typeof bottleVolumeMap] || 0.75;
    const totalBottledVolume = bottleVolume * parseInt(numberOfBottles);
    const newNetWeight = remainderLbs; // Convert gallons to lbs

    // Update container
    const updatedContainer = await prisma.container.update({
      where: { id: containerId },
      data: {
        netWeight: newNetWeight,
        status: newNetWeight <= 0 ? 'EMPTY' : 'FILLED'
      }
    });

    const transactionType = {
      'keep': TRANSACTION_TYPES.BOTTLE_KEEP,
      'empty': TRANSACTION_TYPES.BOTTLE_EMPTY,
      'loss': TRANSACTION_TYPES.BOTTLING_LOSS,
      'gain': TRANSACTION_TYPES.BOTTLING_GAIN
    };
    let adjustmentAmount = 0;
    if(remainderAction != 'keep'){
      adjustmentAmount = Number(req.body?.adjustmentAmount);
    }
    // Create transaction log
    await prisma.transaction.create({
      data: {
        userId,
        transactionType: transactionType[remainderAction as keyof typeof transactionType] as TransactionType,
        containerId,
        volumeGallons: -totalBottledVolume,
        notes: remainderAction === 'keep' ? `Bottled ${bottleNameMap[bottleSize as keyof typeof bottleNameMap]} x ${numberOfBottles} bottles`: `Bottled ${bottleNameMap[bottleSize as keyof typeof bottleNameMap]}ml x ${numberOfBottles} bottles, ${adjustmentAmount} WG are ${remainderAction} from container`
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
