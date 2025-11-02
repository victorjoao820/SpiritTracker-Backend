import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

// Get all fermenters for authenticated user
export const getAllFermenters = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    const fermenters = await prisma.fermenter.findMany({
      where: { userId: req.user?.userId },
      orderBy: { name: 'asc' },
    });

    res.json(fermenters);
  } catch (error) {
    console.error('Error fetching fermenters:', error);
    res.status(500).json({ error: 'Failed to fetch fermenters' });
  }
};

// Get single fermenter
export const getFermenterById = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const fermenter = await prisma.fermenter.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
    });

    if (!fermenter) {
      return res.status(404).json({ error: 'Fermenter not found' });
    }

    res.json(fermenter);
  } catch (error) {
    console.error('Error fetching fermenter:', error);
    res.status(500).json({ error: 'Failed to fetch fermenter' });
  }
};

// Create fermenter
export const createFermenter = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { name, capacityGallons, description } = req.body;

    const fermenter = await prisma.fermenter.create({
      data: {
        userId,
        name,
        capacityGallons: capacityGallons ? parseFloat(capacityGallons) : null,
        notes: description || null,
      },
    });

    res.status(201).json(fermenter);
  } catch (error) {
    console.error('Error creating fermenter:', error);
    res.status(500).json({ error: 'Failed to create fermenter' });
  }
};

// Update fermenter
export const updateFermenter = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { name, capacityGallons, description } = req.body;

    // Check if fermenter exists and belongs to user
    const existing = await prisma.fermenter.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Fermenter not found' });
    }

    const fermenter = await prisma.fermenter.update({
      where: { id: req.params.id },
      data: {
        name: name !== undefined ? name : existing.name,
        capacityGallons: capacityGallons !== undefined ? (capacityGallons ? parseFloat(capacityGallons) : null) : existing.capacityGallons,
        notes: description !== undefined ? description : existing.notes,
      },
    });

    res.json(fermenter);
  } catch (error) {
    console.error('Error updating fermenter:', error);
    res.status(500).json({ error: 'Failed to update fermenter' });
  }
};

// Delete fermenter
export const deleteFermenter = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if fermenter exists and belongs to user
    const existing = await prisma.fermenter.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
      include: {
        fermentations: true,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Fermenter not found' });
    }

    // Check if any fermentations are using this fermenter
    if (existing.fermentations.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete fermenter that is in use by fermentations',
      });
    }

    await prisma.fermenter.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Fermenter deleted successfully' });
  } catch (error) {
    console.error('Error deleting fermenter:', error);
    res.status(500).json({ error: 'Failed to delete fermenter' });
  }
};

