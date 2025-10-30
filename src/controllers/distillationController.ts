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
            batchName: true,
            status: true,
            mashBill: true
          }
        },
        container:{
          select:{
            id:true,
            name:true,
            status: true
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
            batchName: true,
            status: true,
            mashBill: true
          }
        },
        container:{
          select:{
            id:true,
            name:true,
            status: true
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
      storeYieldContainer,
      batchType,
      batchName,
      startDate,
      endDate,
      chargeProof,
      yieldProof,
      chargeTemperature,
      yieldTemperature,
      chargeVolumeGallons,
      yieldVolumeGallons,
      notes
    } = req.body;

    const distillation = await prisma.distillation.create({
      data: {
        fermentationId: fermentationId || null,
        productId: productId || null,
        storeYieldContainer: storeYieldContainer || null,
        batchType: batchType || 'DISTILLATION',
        batchName: batchName || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        chargeProof: chargeProof ? parseFloat(chargeProof) : null,
        yieldProof: yieldProof ? parseFloat(yieldProof) : null,
        chargeTemperature: chargeTemperature ? parseFloat(chargeTemperature) : null,
        yieldTemperature: yieldTemperature ? parseFloat(yieldTemperature) : null,
        chargeVolumeGallons: chargeVolumeGallons ? parseFloat(chargeVolumeGallons) : null,
        yieldVolumeGallons: yieldVolumeGallons ? parseFloat(yieldVolumeGallons) : null,
        notes: notes || null,
        userId
      },
      include: {
        container:{
          select: {
            id: true,
            name: true,
          }
        },
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
            batchName: true,
            status: true,
            mashBill: true
          }
        }
      }
    });
    console.log("distillation:", distillation);
    res.json(distillation);
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
      storeYieldContainer,
      batchType,
      batchName,
      startDate,
      endDate,
      chargeProof,
      yieldProof,
      chargeTemperature,
      yieldTemperature,
      chargeVolumeGallons,
      yieldVolumeGallons,
      status,
      notes
    } = req.body;


    if (fermentationId !== undefined) updateData.fermentationId = fermentationId || null;
    if (productId !== undefined) updateData.productId = productId || null;
    if (storeYieldContainer !== undefined) updateData.storeYieldContainer = storeYieldContainer || null;
    if (batchType !== undefined) updateData.batchType = batchType;
    if (batchName !== undefined) updateData.batchName = batchName || null;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (chargeProof !== undefined) updateData.chargeProof = chargeProof ? parseFloat(chargeProof) : null;
    if (yieldProof !== undefined) updateData.yieldProof = yieldProof ? parseFloat(yieldProof) : null;
    if (chargeTemperature !== undefined) updateData.chargeTemperature = chargeTemperature ? parseFloat(chargeTemperature) : null;
    if (yieldTemperature !== undefined) updateData.yieldTemperature = yieldTemperature ? parseFloat(yieldTemperature) : null;
    if (chargeVolumeGallons !== undefined) updateData.chargeVolumeGallons = chargeVolumeGallons ? parseFloat(chargeVolumeGallons) : null;
    if (yieldVolumeGallons !== undefined) updateData.yieldVolumeGallons = yieldVolumeGallons ? parseFloat(yieldVolumeGallons) : null;
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
            batchName: true,
            status: true,
            mashBill: true
          }
        },
        container:{
          select:{
            id:true,
            name:true,
            status: true
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
