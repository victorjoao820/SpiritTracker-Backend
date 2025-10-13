import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Container } from '@prisma/client';

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
      orderBy: { createdAt: 'desc' }
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
      containerNumber,
      containerType,
      capacityGallons,
      currentVolumeGallons,
      productId,
      proof,
      temperatureFahrenheit,
      fillDate,
      dumpDate,
      isEmpty = false,
      status = 'EMPTY',
      location,
      notes
    } = req.body;

    const container = await prisma.container.create({
      data: {
        containerNumber: containerNumber || null,
        containerType,
        capacityGallons: parseFloat(capacityGallons),
        currentVolumeGallons: currentVolumeGallons ? parseFloat(currentVolumeGallons) : null,
        productId: productId || null,
        proof: proof ? parseFloat(proof) : null,
        temperatureFahrenheit: temperatureFahrenheit ? parseFloat(temperatureFahrenheit) : null,
        fillDate: fillDate ? new Date(fillDate) : null,
        dumpDate: dumpDate ? new Date(dumpDate) : null,
        isEmpty,
        status,
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
      containerNumber,
      containerType,
      capacityGallons,
      currentVolumeGallons,
      productId,
      proof,
      temperatureFahrenheit,
      fillDate,
      dumpDate,
      isEmpty,
      status,
      location,
      notes
    } = req.body;

    if (containerNumber !== undefined) updateData.containerNumber = containerNumber || null;
    if (containerType !== undefined) updateData.containerType = containerType;
    if (capacityGallons !== undefined) updateData.capacityGallons = parseFloat(capacityGallons);
    if (currentVolumeGallons !== undefined) updateData.currentVolumeGallons = currentVolumeGallons ? parseFloat(currentVolumeGallons) : null;
    if (productId !== undefined) updateData.productId = productId || null;
    if (proof !== undefined) updateData.proof = proof ? parseFloat(proof) : null;
    if (temperatureFahrenheit !== undefined) updateData.temperatureFahrenheit = temperatureFahrenheit ? parseFloat(temperatureFahrenheit) : null;
    if (fillDate !== undefined) updateData.fillDate = fillDate ? new Date(fillDate) : null;
    if (dumpDate !== undefined) updateData.dumpDate = dumpDate ? new Date(dumpDate) : null;
    if (isEmpty !== undefined) updateData.isEmpty = isEmpty;
    if (status !== undefined) updateData.status = status;
    if (location !== undefined) updateData.location = location || null;
    if (notes !== undefined) updateData.notes = notes || null;

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
    const container = await prisma.container.deleteMany({
      where: {
        id: req.params.id,
        userId
      }
    });

    if (container.count === 0) {
      return res.status(404).json({ error: 'Container not found' });
    }

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
        containerNumber: container.containerNumber || null,
        containerType: container.containerType,
        capacityGallons: container.capacityGallons,
        currentVolumeGallons: container.currentVolumeGallons || null,
        productId: container.productId || null,
        proof: container.proof || null,
        temperatureFahrenheit: container.temperatureFahrenheit || null,
        fillDate: container.fillDate || null,
        dumpDate: container.dumpDate || null,
        isEmpty: container.isEmpty || false,
        status: container.status || 'EMPTY',
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
