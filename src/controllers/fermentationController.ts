import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

// Get all fermentations for authenticated user
export const getAllFermentations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const fermentations = await prisma.fermentation.findMany({
      where: { userId },
      include: {
        fermenter: {
          select: {
            id: true,
            name: true,
            capacityGallons: true
          }
        },
        distillations: {
          select: {
            id: true,
            batchName: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(fermentations);
  } catch (error) {
    console.error('Error fetching fermentations:', error);
    res.status(500).json({ error: 'Failed to fetch fermentations' });
  }
};

// Get single fermentation
export const getFermentationById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const fermentation = await prisma.fermentation.findFirst({
      where: {
        id: req.params.id,
        userId
      },
      include: {
        fermenter: {
          select: {
            id: true,
            name: true,
            capacityGallons: true
          }
        },
        distillations: {
          select: {
            id: true,
            batchName: true,
            status: true
          }
        }
      }
    });

    if (!fermentation) {
      return res.status(404).json({ error: 'Fermentation not found' });
    }

    res.json(fermentation);
  } catch (error) {
    console.error('Error fetching fermentation:', error);
    res.status(500).json({ error: 'Failed to fetch fermentation' });
  }
};

// Create new fermentation
export const createFermentation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      batchName,
      fermenterId,
      mashBill,
      startDate,
      endDate,
      volumeGallons,
      startSG,
      notes
    } = req.body;

    const fermentation = await prisma.fermentation.create({
      data: {
        batchName: batchName || null,
        fermenterId: fermenterId || null,
        mashBill: mashBill || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        volumeGallons: volumeGallons ? parseFloat(volumeGallons) : null,
        startSG: startSG ? parseFloat(startSG) : null,
        notes: notes || null,
        userId
      },
      include: {
        fermenter: {
          select: {
            id: true,
            name: true,
            capacityGallons: true
          }
        },
        distillations: {
          select: {
            id: true,
            batchName: true,
            status: true
          }
        }
      }
    });

    res.status(201).json(fermentation);
  } catch (error) {
    console.error('Error creating fermentation:', error);
    res.status(500).json({ error: 'Failed to create fermentation' });
  }
};

// Update fermentation
export const updateFermentation = async (req: AuthenticatedRequest, res: Response) => {
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
      batchName,
      fermenterId,
      mashBill,
      startDate,
      endDate,
      volumeGallons,
      startSG,
      finalFG,
      status,
      ingredient,
      notes
    } = req.body;


    if (batchName !== undefined) updateData.batchName = batchName || null;
    if (fermenterId !== undefined) updateData.fermenterId = fermenterId || null;
    if (mashBill !== undefined) updateData.mashBill = mashBill || null;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (volumeGallons !== undefined) updateData.volumeGallons = volumeGallons ? parseFloat(volumeGallons) : null;
    if (startSG !== undefined) updateData.startSG = startSG ? parseFloat(startSG) : null;
    if (finalFG !== undefined) updateData.finalFG = startSG ? parseFloat(finalFG) : null;

    if (status !== undefined) updateData.status = status;
    if (ingredient !== undefined) updateData.ingredient = ingredient || null;
    if (notes !== undefined) updateData.notes = notes || null;

    const fermentation = await prisma.fermentation.updateMany({
      where: {
        id: req.params.id,
        userId
      },
      data: updateData
    });

    if (fermentation.count === 0) {
      return res.status(404).json({ error: 'Fermentation not found' });
    }

    const updatedFermentation = await prisma.fermentation.findUnique({
      where: { id: req.params.id },
      include: {
        fermenter: {
          select: {
            id: true,
            name: true,
            capacityGallons: true
          }
        },
        distillations: {
          select: {
            id: true,
            batchName: true,
            status: true
          }
        }
      }
    });

    res.json(updatedFermentation);
  } catch (error) {
    console.error('Error updating fermentation:', error);
    res.status(500).json({ error: 'Failed to update fermentation' });
  }
};

// Delete fermentation
export const deleteFermentation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const fermentation = await prisma.fermentation.deleteMany({
      where: {
        id: req.params.id,
        userId
      }
    });

    if (fermentation.count === 0) {
      return res.status(404).json({ error: 'Fermentation not found' });
    }

    res.json({ message: 'Fermentation deleted successfully' });
  } catch (error) {
    console.error('Error deleting fermentation:', error);
    res.status(500).json({ error: 'Failed to delete fermentation' });
  }
};
