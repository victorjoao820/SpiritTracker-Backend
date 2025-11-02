import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { DEFAULT_CONTAINER_KINDS } from '../constants';

/**
 * Initialize default container kinds for a user if they don't exist
 */
export const initializeDefaultContainerKinds = async (userId: string): Promise<void> => {
  try {
    // Check if user already has container kinds
    const existingCount = await prisma.containerKind.count({
      where: { userId }
    });

    // If user has no container kinds, create defaults
    if (existingCount === 0) {
      await prisma.containerKind.createMany({
        data: DEFAULT_CONTAINER_KINDS.map(kind => ({
          ...kind,
          userId,
          tareWeight: kind.tareWeight,
          totalVolume: kind.totalVolume
        })),
        skipDuplicates: true
      });
      console.log(`Initialized default container kinds for user ${userId}`);
    }
  } catch (error) {
    console.error('Error initializing container kinds:', error);
    // Don't throw - allow login to continue even if initialization fails
  }
};

// Get all container kinds for authenticated user
export const getAllContainerKinds = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    let containerKinds = await prisma.containerKind.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    });

    // If no container kinds exist, initialize defaults
    if (containerKinds.length === 0) {
      await initializeDefaultContainerKinds(userId);
      // Fetch again after initialization
      containerKinds = await prisma.containerKind.findMany({
        where: { userId },
        orderBy: { name: 'asc' }
      });
    }

    res.json(containerKinds);
  } catch (error) {
    console.error('Error fetching container kinds:', error);
    res.status(500).json({ error: 'Failed to fetch container kinds' });
  }
};

// Get single container kind
export const getContainerKindById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const containerKind = await prisma.containerKind.findFirst({
      where: {
        id: req.params.id,
        userId
      }
    });

    if (!containerKind) {
      return res.status(404).json({ error: 'Container kind not found' });
    }

    res.json(containerKind);
  } catch (error) {
    console.error('Error fetching container kind:', error);
    res.status(500).json({ error: 'Failed to fetch container kind' });
  }
};

// Create container kind
export const createContainerKind = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { name, type, tareWeight, totalVolume, description } = req.body;

    const containerKind = await prisma.containerKind.create({
      data: {
        userId,
        name,
        type,
        tareWeight: tareWeight ? parseFloat(tareWeight) : null,
        totalVolume: totalVolume ? parseFloat(totalVolume) : null,
        description: description || null
      }
    });

    res.status(201).json(containerKind);
  } catch (error) {
    console.error('Error creating container kind:', error);
    res.status(500).json({ error: 'Failed to create container kind' });
  }
};

// Update container kind
export const updateContainerKind = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { name, type, tareWeight, totalVolume, description } = req.body;

    // Check if container kind exists and belongs to user
    const existing = await prisma.containerKind.findFirst({
      where: {
        id: req.params.id,
        userId
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Container kind not found' });
    }

    const containerKind = await prisma.containerKind.update({
      where: { id: req.params.id },
      data: {
        name: name !== undefined ? name : existing.name,
        type: type !== undefined ? type : existing.type,
        tareWeight: tareWeight !== undefined ? (tareWeight ? parseFloat(tareWeight) : null) : existing.tareWeight,
        totalVolume: totalVolume !== undefined ? (totalVolume ? parseFloat(totalVolume) : null) : existing.totalVolume,
        description: description !== undefined ? description : existing.description
      }
    });

    res.json(containerKind);
  } catch (error) {
    console.error('Error updating container kind:', error);
    res.status(500).json({ error: 'Failed to update container kind' });
  }
};

// Delete container kind
export const deleteContainerKind = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if container kind exists and belongs to user
    const existing = await prisma.containerKind.findFirst({
      where: {
        id: req.params.id,
        userId
      },
      include: {
        containers: true
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Container kind not found' });
    }

    // Check if any containers are using this kind
    if (existing.containers.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete container kind that is in use by containers'
      });
    }

    await prisma.containerKind.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Container kind deleted successfully' });
  } catch (error) {
    console.error('Error deleting container kind:', error);
    res.status(500).json({ error: 'Failed to delete container kind' });
  }
};

