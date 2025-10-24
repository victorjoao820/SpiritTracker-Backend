import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

// Get all distillations for authenticated user
export const getAllDistillations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const distillations = await prisma.distillation.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        fermentation: {
          select: {
            id: true,
            batchNumber: true,
            status: true,
            mashBill: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(distillations);
  } catch (error) {
    console.error('Error fetching distillations:', error);
    res.status(500).json({ error: 'Failed to fetch distillations' });
  }
};

// Get single distillation
export const getDistillationById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const distillation = await prisma.distillation.findFirst({
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
        },
        fermentation: {
          select: {
            id: true,
            batchNumber: true,
            status: true,
            mashBill: true
          }
        }
      }
    });

    if (!distillation) {
      return res.status(404).json({ error: 'Distillation not found' });
    }

    res.json(distillation);
  } catch (error) {
    console.error('Error fetching distillation:', error);
    res.status(500).json({ error: 'Failed to fetch distillation' });
  }
};

// Create new distillation
export const createDistillation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      fermentationId,
      productId,
      batchType,
      batchNumber,
      startDate,
      endDate,
      volumeGallons,
      chargeProof,
      yeildProof,
      chargeTemperature,
      yeildTemperature,
      chargeVolumeGallons,
      yeildVolumeGallons,
      notes
    } = req.body;

    const distillation = await prisma.distillation.create({
      data: {
        fermentationId: fermentationId || null,
        productId: productId || null,
        batchType: batchType || 'DISTILLATION',
        batchNumber: batchNumber || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        volumeGallons: volumeGallons ? parseFloat(volumeGallons) : null,
        chargeProof: chargeProof ? parseFloat(chargeProof) : null,
        yeildProof: yeildProof ? parseFloat(yeildProof) : null,
        chargeTemperature: chargeTemperature ? parseFloat(chargeTemperature) : null,
        yeildTemperature: yeildTemperature ? parseFloat(yeildTemperature) : null,
        chargeVolumeGallons: chargeVolumeGallons ? parseFloat(chargeVolumeGallons) : null,
        yeildVolumeGallons: yeildVolumeGallons ? parseFloat(yeildVolumeGallons) : null,
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
        },
        fermentation: {
          select: {
            id: true,
            batchNumber: true,
            status: true,
            mashBill: true
          }
        }
      }
    });

    res.status(201).json(distillation);
  } catch (error) {
    console.error('Error creating distillation:', error);
    res.status(500).json({ error: 'Failed to create distillation' });
  }
};

// Update distillation
export const updateDistillation = async (req: AuthenticatedRequest, res: Response) => {
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
      fermentationId,
      productId,
      batchType,
      batchNumber,
      startDate,
      endDate,
      volumeGallons,
      chargeProof,
      yeildProof,
      chargeTemperature,
      yeildTemperature,
      chargeVolumeGallons,
      yeildVolumeGallons,
      status,
      notes
    } = req.body;

    if (fermentationId !== undefined) updateData.fermentationId = fermentationId || null;
    if (productId !== undefined) updateData.productId = productId || null;
    if (batchType !== undefined) updateData.batchType = batchType;
    if (batchNumber !== undefined) updateData.batchNumber = batchNumber || null;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (volumeGallons !== undefined) updateData.volumeGallons = volumeGallons ? parseFloat(volumeGallons) : null;
    if (chargeProof !== undefined) updateData.chargeProof = chargeProof ? parseFloat(chargeProof) : null;
    if (yeildProof !== undefined) updateData.yeildProof = yeildProof ? parseFloat(yeildProof) : null;
    if (chargeTemperature !== undefined) updateData.chargeTemperature = chargeTemperature ? parseFloat(chargeTemperature) : null;
    if (yeildTemperature !== undefined) updateData.yeildTemperature = yeildTemperature ? parseFloat(yeildTemperature) : null;
    if (chargeVolumeGallons !== undefined) updateData.chargeVolumeGallons = chargeVolumeGallons ? parseFloat(chargeVolumeGallons) : null;
    if (yeildVolumeGallons !== undefined) updateData.yeildVolumeGallons = yeildVolumeGallons ? parseFloat(yeildVolumeGallons) : null;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes || null;

    const distillation = await prisma.distillation.updateMany({
      where: {
        id: req.params.id,
        userId
      },
      data: updateData
    });

    if (distillation.count === 0) {
      return res.status(404).json({ error: 'Distillation not found' });
    }

    const updatedDistillation = await prisma.distillation.findUnique({
      where: { id: req.params.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        fermentation: {
          select: {
            id: true,
            batchNumber: true,
            status: true,
            mashBill: true
          }
        }
      }
    });

    res.json(updatedDistillation);
  } catch (error) {
    console.error('Error updating distillation:', error);
    res.status(500).json({ error: 'Failed to update distillation' });
  }
};

// Delete distillation
export const deleteDistillation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const distillation = await prisma.distillation.deleteMany({
      where: {
        id: req.params.id,
        userId
      }
    });

    if (distillation.count === 0) {
      return res.status(404).json({ error: 'Distillation not found' });
    }

    res.json({ message: 'Distillation deleted successfully' });
  } catch (error) {
    console.error('Error deleting distillation:', error);
    res.status(500).json({ error: 'Failed to delete distillation' });
  }
};
