import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

// Get all DSPs for authenticated user
export const getAllDSPs = async (
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
    const dsps = await prisma.dSP.findMany({
      where: { userId: req.user?.userId },
      orderBy: { name: 'asc' },
    });

    res.json(dsps);
  } catch (error) {
    console.error('Error fetching DSPs:', error);
    res.status(500).json({ error: 'Failed to fetch DSPs' });
  }
};

// Get single DSP
export const getDSPById = async (
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

    const dsp = await prisma.dSP.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
    });

    if (!dsp) {
      return res.status(404).json({ error: 'DSP not found' });
    }

    res.json(dsp);
  } catch (error) {
    console.error('Error fetching DSP:', error);
    res.status(500).json({ error: 'Failed to fetch DSP' });
  }
};

// Create new DSP
export const createDSP = async (
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

    const { name, description } = req.body;

    const dsp = await prisma.dSP.create({
      data: {
        name,
        description: description || '',
        userId,
      },
    });

    res.status(201).json(dsp);
  } catch (error) {
    console.error('Error creating DSP:', error);
    res.status(500).json({ error: 'Failed to create DSP' });
  }
};

// Update DSP
export const updateDSP = async (
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

    const { name, description } = req.body;

    const dsp = await prisma.dSP.updateMany({
      where: {
        id: req.params.id,
        userId,
      },
      data: {
        name,
        description: description || '',
      },
    });

    if (dsp.count === 0) {
      return res.status(404).json({ error: 'DSP not found' });
    }

    const updatedDSP = await prisma.dSP.findUnique({
      where: { id: req.params.id },
    });

    res.json(updatedDSP);
  } catch (error) {
    console.error('Error updating DSP:', error);
    res.status(500).json({ error: 'Failed to update DSP' });
  }
};

// Delete DSP
export const deleteDSP = async (
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

    const dsp = await prisma.dSP.deleteMany({
      where: {
        id: req.params.id,
        userId,
      },
    });

    if (dsp.count === 0) {
      return res.status(404).json({ error: 'DSP not found' });
    }

    res.json({ message: 'DSP deleted successfully' });
  } catch (error) {
    console.error('Error deleting DSP:', error);
    res.status(500).json({ error: 'Failed to delete DSP' });
  }
};

