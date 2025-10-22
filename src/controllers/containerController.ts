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
    console.log("userId:", req.user);
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

    console.log("container:", req.body);

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
      fillDate,
      location,
      notes
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
