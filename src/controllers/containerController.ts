import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Container, TransactionType } from '@prisma/client';
import { TRANSACTION_TYPES } from '../constants';
// @ts-expect-error - helpers.js needs conversion to TypeScript
import { calcGallonsFromWeight, calculateSpiritDensity } from '../utils/helpers';

// Get all containers for authenticated user
export const getAllContainers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const containers = await prisma.container.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(containers);
  } catch (error) {
    console.error('Error fetching containers:', error);
    res.status(500).json({ error: 'Failed to fetch containers' });
  }
};

// Get single container
export const getContainerById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const container = await prisma.container.findFirst({
      where: {
        id: req.params.id,
        userId
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

    if (!container) {
      return res.status(404).json({ error: 'Container not found' });
    }

    res.json(container);
  } catch (error) {
    console.error('Error fetching container:', error);
    res.status(500).json({ error: 'Failed to fetch container' });
  }
};

// Create new container
export const createContainer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const {
      name,
      type,
      productId,
      status = 'EMPTY',
      account,
      proof,
      tareWeight,
      netWeight,
      temperatureFahrenheit,
      fillDate,
      location,
      notes
    } = req.body;

    const container = await prisma.container.create({
      data: {
        name: name || null,
        type: type || null,
        productId: productId || null,
        status,
        account: account || null,
        proof: proof ? parseFloat(proof) : null,
        tareWeight: tareWeight ? parseFloat(tareWeight) : null,
        netWeight: netWeight ? parseFloat(netWeight) : null,
        temperatureFahrenheit: temperatureFahrenheit ? parseFloat(temperatureFahrenheit) : null,
        fillDate: fillDate ? new Date(fillDate) : null,
        location: location || null,
        notes: notes || null,
        userId
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

    // Log transaction
    const transactionType = status === 'EMPTY' 
      ? TRANSACTION_TYPES.CREATE_EMPTY_CONTAINER 
      : TRANSACTION_TYPES.CREATE_FILLED_CONTAINER;
    
    let transactionNotes = status === 'EMPTY' ? "New empty container created." : "New filled container created.";
    
    await prisma.transaction.create({
      data: {
        userId,
        transactionType: transactionType as TransactionType,
        containerId: container.id,
        productId: productId || null,
        proof: proof ? parseFloat(proof) : null,
        volumeGallons: netWeight ? parseFloat(netWeight) : null,
        temperatureFahrenheit: temperatureFahrenheit ? parseFloat(temperatureFahrenheit) : null,
        notes: transactionNotes
      }
    });

    res.status(201).json(container);
  } catch (error) {
    console.error('Error creating container:', error);
    res.status(500).json({ error: 'Failed to create container' });
  }
};

// Update container
export const updateContainer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const updateData: any = {};
    const {
      name,
      type,
      productId,
      status,
      account,
      proof,
      tareWeight,
      netWeight,
      temperatureFahrenheit,
      fillDate
    } = req.body;

    if (name !== undefined) updateData.name = name || null;
    if (type !== undefined) updateData.type = type || null;
    if (productId !== undefined) updateData.productId = productId || null;
    if (status !== undefined) updateData.status = status;
    if (account !== undefined) updateData.account = account || null;
    if (proof !== undefined) updateData.proof = proof ? parseFloat(proof) : null;
    if (tareWeight !== undefined) updateData.tareWeight = tareWeight ? parseFloat(tareWeight) : null;
    if (netWeight !== undefined) updateData.netWeight = netWeight ? parseFloat(netWeight) : null;
    if (temperatureFahrenheit !== undefined) updateData.temperatureFahrenheit = temperatureFahrenheit ? parseFloat(temperatureFahrenheit) : null;
    if (fillDate !== undefined) updateData.fillDate = fillDate ? new Date(fillDate) : null;


    console.log("req.body: ", req.body);
    const containerData = await prisma.container.findFirst({
      where: {
        id: req.params.id,
        userId
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
    if (!containerData) {
      return res.status(404).json({ error: 'Container not found' });
    }

    // Get new product name if productId changed
    let newProduct = null;
    if (updateData.productId && containerData.productId !== updateData.productId) {
      const productData = await prisma.product.findUnique({
        where: { id: updateData.productId }
      });
      newProduct = productData;
    }

    // Determine transaction type based on status change
    let transactionType = null;
    if (updateData.status && containerData.status !== updateData.status) {
      if (containerData.status === 'EMPTY' && updateData.status === 'FILLED') {
        transactionType = TRANSACTION_TYPES.REFILL_CONTAINER;
      } else if (containerData.status === 'FILLED' && updateData.status === 'EMPTY') {
        transactionType = TRANSACTION_TYPES.EDIT_EMPTY_FROM_FILLED;
      } else {
        transactionType = TRANSACTION_TYPES.EDIT_FILL_DATA_CORRECTION;
      }
    } else {
      transactionType = containerData.status === 'EMPTY' 
        ? TRANSACTION_TYPES.EDIT_EMPTY_DATA_CORRECTION 
        : TRANSACTION_TYPES.EDIT_FILL_DATA_CORRECTION;
    }

    //Check changes for logTransaction
    let notes = "";
      if (containerData.name != updateData.name) notes += "Container name:" + containerData.name + " -> " + updateData.name + ". ";
      if (containerData.proof != updateData.proof) notes += "Proof:" + containerData.proof + " -> " + updateData.proof + ". ";
      if (containerData.productId != updateData.productId){
        const oldProductName = containerData.product?.name || 'N/A';
        const newProductName = newProduct?.name || 'N/A';
        notes += "Product: " + oldProductName + " -> " + newProductName + ". ";
      }
      if (containerData.account != updateData.account) notes += "Account:" + containerData.account + " -> " + updateData.account + ". ";
      if (containerData.tareWeight != updateData.tareWeight) notes += "Tare weight:" + containerData.tareWeight + "lbs -> " + updateData.tareWeight + "lbs. ";
      if (containerData.netWeight != updateData.netWeight) notes += "Net weight:" + parseFloat(containerData.netWeight?.toString() || '0').toFixed(2) + "lbs -> " + parseFloat(updateData.netWeight?.toString() || '0').toFixed(2) + "lbs. ";
      if (containerData.temperatureFahrenheit != updateData.temperatureFahrenheit) notes += "Temperature:" + containerData.temperatureFahrenheit + " -> " + updateData.temperatureFahrenheit + ". ";
      
      // If refilling, add refill note
      if (updateData.status && containerData.status === 'EMPTY' && updateData.status === 'FILLED') {
        notes = "refill via weight method. " + notes;
      }
      
      if(notes != ""){
        await prisma.transaction.create({
          data: {
            transactionType: transactionType as TransactionType,
            userId,
            containerId: containerData.id,
            productId: updateData?.productId,
            proof: (proof && containerData.proof) ? (proof - Number(containerData.proof)).toFixed(2) : 0,
            // proofGallons: ,
            volumeGallons: (updateData.netWeight && containerData.netWeight && updateData.proof)
              ? (Number(updateData.netWeight) - Number(containerData.netWeight)) / calculateSpiritDensity(Number(updateData.proof))
              : 0,
            proofGallons: (updateData.proof && containerData.proof && containerData.netWeight)
              ? calcGallonsFromWeight(updateData.proof, updateData.netWeight || 0).proofGallons - calcGallonsFromWeight(containerData.proof, containerData.netWeight).proofGallons
              : 0,
            temperatureFahrenheit:updateData.temperatureFahrenheit,
            notes,  
          }
        });
      }

    const container = await prisma.container.updateMany({
      where: {
        id: req.params.id,
        userId
      },
      data: updateData
    });

    if (container.count === 0) {
      return res.status(404).json({ error: 'Container not found' });
    }

    const updatedContainer = await prisma.container.findUnique({
      where: { id: req.params.id },
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

    res.json(updatedContainer);
  } catch (error) {
    console.error('Error updating container:', error);
    res.status(500).json({ error: 'Failed to update container' });
  }
};

// Delete container
export const deleteContainer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    console.log("Deleting container: ", req.params);
    // Get container data before deleting
    const containerData = await prisma.container.findFirst({
      where: {
        id: req.params.id,
        userId,
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
    
    if (!containerData) {
      return res.status(404).json({ error: 'Container not found' });
    }
    

    // Log transaction
    const deleteTransactionType = containerData.status === 'EMPTY' 
      ? TRANSACTION_TYPES.DELETE_EMPTY_CONTAINER 
      : TRANSACTION_TYPES.DELETE_FILLED_CONTAINER;
    
    await prisma.transaction.create({
      data: {
        userId,
        transactionType: deleteTransactionType as TransactionType,
        containerId: containerData.id,
        productId: containerData.productId,
        notes: "Container deleted. " + "Container Name:" + containerData.name + " - " + "Product:" + containerData.product?.name + ", Type:" + containerData.type + "."
      }
    });


    await prisma.container.delete({
      where: { id: req.params.id, 
              userId 
            }
    });

    res.json({ message: 'Container deleted successfully' });
  } catch (error) {
    console.error('Error deleting container:', error);
    res.status(500).json({ error: 'Failed to delete container' });
  }
};

// Bulk create containers (for import functionality)
export const bulkCreateContainers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const { containers } = req.body;

    const createdContainers = await prisma.container.createMany({
      data: containers.map((container: Container) => ({
        name: container.name || null,
        type: container.type || null,
        productId: container.productId || null,
        status: container.status || 'EMPTY',
        account: container.account || null,
        proof: container.proof || null,
        tareWeight: container.tareWeight || null,
        netWeight: container.netWeight || null,
        temperatureFahrenheit: container.temperatureFahrenheit || null,
        fillDate: container.fillDate || null,
        location: container.location || null,
        notes: container.notes || null,
        userId
      })),
      skipDuplicates: true
    });

    res.status(201).json({
      message: `${createdContainers.count} containers created successfully`,
      count: createdContainers.count
    });
  } catch (error) {
    console.error('Error bulk creating containers:', error);
    res.status(500).json({ error: 'Failed to create containers' });
  }
};
