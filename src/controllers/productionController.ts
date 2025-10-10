import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

// Get all production batches for authenticated user
export const getAllProductionBatches = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const batches = await prisma.productionBatch.findMany({
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
      orderBy: { createdAt: 'desc' }
    });

    res.json(batches);
  } catch (error) {
    console.error('Error fetching production batches:', error);
    res.status(500).json({ error: 'Failed to fetch production batches' });
  }
};

// Get single production batch
export const getProductionBatchById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const batch = await prisma.productionBatch.findFirst({
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

    if (!batch) {
      return res.status(404).json({ error: 'Production batch not found' });
    }

    res.json(batch);
  } catch (error) {
    console.error('Error fetching production batch:', error);
    res.status(500).json({ error: 'Failed to fetch production batch' });
  }
};

// Create new production batch
export const createProductionBatch = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      batchType,
      productId,
      batchNumber,
      startDate,
      endDate,
      volumeGallons,
      proof,
      notes
    } = req.body;

    const batch = await prisma.productionBatch.create({
      data: {
        batchType,
        productId: productId || null,
        batchNumber: batchNumber || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        volumeGallons: volumeGallons ? parseFloat(volumeGallons) : null,
        proof: proof ? parseFloat(proof) : null,
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

    res.status(201).json(batch);
  } catch (error) {
    console.error('Error creating production batch:', error);
    res.status(500).json({ error: 'Failed to create production batch' });
  }
};

// Update production batch
export const updateProductionBatch = async (req: AuthenticatedRequest, res: Response) => {
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
      batchType,
      productId,
      batchNumber,
      startDate,
      endDate,
      volumeGallons,
      proof,
      notes
    } = req.body;

    if (batchType !== undefined) updateData.batchType = batchType;
    if (productId !== undefined) updateData.productId = productId || null;
    if (batchNumber !== undefined) updateData.batchNumber = batchNumber || null;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (volumeGallons !== undefined) updateData.volumeGallons = volumeGallons ? parseFloat(volumeGallons) : null;
    if (proof !== undefined) updateData.proof = proof ? parseFloat(proof) : null;
    if (notes !== undefined) updateData.notes = notes || null;

    const batch = await prisma.productionBatch.updateMany({
      where: {
        id: req.params.id,
        userId
      },
      data: updateData
    });

    if (batch.count === 0) {
      return res.status(404).json({ error: 'Production batch not found' });
    }

    const updatedBatch = await prisma.productionBatch.findUnique({
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

    res.json(updatedBatch);
  } catch (error) {
    console.error('Error updating production batch:', error);
    res.status(500).json({ error: 'Failed to update production batch' });
  }
};

// Delete production batch
export const deleteProductionBatch = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const batch = await prisma.productionBatch.deleteMany({
      where: {
        id: req.params.id,
        userId
      }
    });

    if (batch.count === 0) {
      return res.status(404).json({ error: 'Production batch not found' });
    }

    res.json({ message: 'Production batch deleted successfully' });
  } catch (error) {
    console.error('Error deleting production batch:', error);
    res.status(500).json({ error: 'Failed to delete production batch' });
  }
};
