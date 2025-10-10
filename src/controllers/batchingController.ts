import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

// Get all batching runs for authenticated user
export const getAllBatchingRuns = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { status, batchType, productId } = req.query;
    const whereClause: any = { userId };

    if (status) whereClause.status = status;
    if (batchType) whereClause.batchType = batchType;
    if (productId) whereClause.productId = productId;

    const runs = await prisma.batchingRun.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        bottlingRuns: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(runs);
  } catch (error) {
    console.error('Error fetching batching runs:', error);
    res.status(500).json({ error: 'Failed to fetch batching runs' });
  }
};

// Get single batching run
export const getBatchingRunById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const run = await prisma.batchingRun.findFirst({
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
        bottlingRuns: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!run) {
      return res.status(404).json({ error: 'Batching run not found' });
    }

    res.json(run);
  } catch (error) {
    console.error('Error fetching batching run:', error);
    res.status(500).json({ error: 'Failed to fetch batching run' });
  }
};

// Create new batching run
export const createBatchingRun = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      batchNumber,
      productId,
      batchType,
      startDate,
      endDate,
      volumeGallons,
      proof,
      temperatureFahrenheit,
      status = 'IN_PROGRESS',
      notes
    } = req.body;

    const run = await prisma.batchingRun.create({
      data: {
        batchNumber,
        productId: productId || null,
        batchType,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        volumeGallons: volumeGallons ? parseFloat(volumeGallons) : null,
        proof: proof ? parseFloat(proof) : null,
        temperatureFahrenheit: temperatureFahrenheit ? parseFloat(temperatureFahrenheit) : null,
        status,
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

    res.status(201).json(run);
  } catch (error) {
    console.error('Error creating batching run:', error);
    res.status(500).json({ error: 'Failed to create batching run' });
  }
};

// Update batching run
export const updateBatchingRun = async (req: AuthenticatedRequest, res: Response) => {
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
      batchNumber,
      productId,
      batchType,
      startDate,
      endDate,
      volumeGallons,
      proof,
      temperatureFahrenheit,
      status,
      notes
    } = req.body;

    if (batchNumber !== undefined) updateData.batchNumber = batchNumber;
    if (productId !== undefined) updateData.productId = productId || null;
    if (batchType !== undefined) updateData.batchType = batchType;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (volumeGallons !== undefined) updateData.volumeGallons = volumeGallons ? parseFloat(volumeGallons) : null;
    if (proof !== undefined) updateData.proof = proof ? parseFloat(proof) : null;
    if (temperatureFahrenheit !== undefined) updateData.temperatureFahrenheit = temperatureFahrenheit ? parseFloat(temperatureFahrenheit) : null;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes || null;

    const run = await prisma.batchingRun.updateMany({
      where: {
        id: req.params.id,
        userId
      },
      data: updateData
    });

    if (run.count === 0) {
      return res.status(404).json({ error: 'Batching run not found' });
    }

    const updatedRun = await prisma.batchingRun.findUnique({
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

    res.json(updatedRun);
  } catch (error) {
    console.error('Error updating batching run:', error);
    res.status(500).json({ error: 'Failed to update batching run' });
  }
};

// Delete batching run
export const deleteBatchingRun = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const run = await prisma.batchingRun.deleteMany({
      where: {
        id: req.params.id,
        userId
      }
    });

    if (run.count === 0) {
      return res.status(404).json({ error: 'Batching run not found' });
    }

    res.json({ message: 'Batching run deleted successfully' });
  } catch (error) {
    console.error('Error deleting batching run:', error);
    res.status(500).json({ error: 'Failed to delete batching run' });
  }
};

// Get all bottling runs for authenticated user
export const getAllBottlingRuns = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { status, productId, batchingRunId } = req.query;
    const whereClause: any = { userId };

    if (status) whereClause.status = status;
    if (productId) whereClause.productId = productId;
    if (batchingRunId) whereClause.batchingRunId = batchingRunId;

    const runs = await prisma.bottlingRun.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        batchingRun: {
          select: {
            id: true,
            batchNumber: true,
            batchType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(runs);
  } catch (error) {
    console.error('Error fetching bottling runs:', error);
    res.status(500).json({ error: 'Failed to fetch bottling runs' });
  }
};

// Get single bottling run
export const getBottlingRunById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const run = await prisma.bottlingRun.findFirst({
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
        batchingRun: {
          select: {
            id: true,
            batchNumber: true,
            batchType: true
          }
        }
      }
    });

    if (!run) {
      return res.status(404).json({ error: 'Bottling run not found' });
    }

    res.json(run);
  } catch (error) {
    console.error('Error fetching bottling run:', error);
    res.status(500).json({ error: 'Failed to fetch bottling run' });
  }
};

// Create new bottling run
export const createBottlingRun = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      batchingRunId,
      batchNumber,
      productId,
      bottleSize,
      bottlesProduced,
      volumeGallons,
      proof,
      startDate,
      endDate,
      status = 'IN_PROGRESS',
      notes
    } = req.body;

    const run = await prisma.bottlingRun.create({
      data: {
        batchingRunId: batchingRunId || null,
        batchNumber,
        productId: productId || null,
        bottleSize: parseFloat(bottleSize),
        bottlesProduced: parseInt(bottlesProduced),
        volumeGallons: parseFloat(volumeGallons),
        proof: parseFloat(proof),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status,
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
        batchingRun: {
          select: {
            id: true,
            batchNumber: true,
            batchType: true
          }
        }
      }
    });

    res.status(201).json(run);
  } catch (error) {
    console.error('Error creating bottling run:', error);
    res.status(500).json({ error: 'Failed to create bottling run' });
  }
};

// Update bottling run
export const updateBottlingRun = async (req: AuthenticatedRequest, res: Response) => {
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
      batchingRunId,
      batchNumber,
      productId,
      bottleSize,
      bottlesProduced,
      volumeGallons,
      proof,
      startDate,
      endDate,
      status,
      notes
    } = req.body;

    if (batchingRunId !== undefined) updateData.batchingRunId = batchingRunId || null;
    if (batchNumber !== undefined) updateData.batchNumber = batchNumber;
    if (productId !== undefined) updateData.productId = productId || null;
    if (bottleSize !== undefined) updateData.bottleSize = parseFloat(bottleSize);
    if (bottlesProduced !== undefined) updateData.bottlesProduced = parseInt(bottlesProduced);
    if (volumeGallons !== undefined) updateData.volumeGallons = parseFloat(volumeGallons);
    if (proof !== undefined) updateData.proof = parseFloat(proof);
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes || null;

    const run = await prisma.bottlingRun.updateMany({
      where: {
        id: req.params.id,
        userId
      },
      data: updateData
    });

    if (run.count === 0) {
      return res.status(404).json({ error: 'Bottling run not found' });
    }

    const updatedRun = await prisma.bottlingRun.findUnique({
      where: { id: req.params.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        batchingRun: {
          select: {
            id: true,
            batchNumber: true,
            batchType: true
          }
        }
      }
    });

    res.json(updatedRun);
  } catch (error) {
    console.error('Error updating bottling run:', error);
    res.status(500).json({ error: 'Failed to update bottling run' });
  }
};

// Delete bottling run
export const deleteBottlingRun = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const run = await prisma.bottlingRun.deleteMany({
      where: {
        id: req.params.id,
        userId
      }
    });

    if (run.count === 0) {
      return res.status(404).json({ error: 'Bottling run not found' });
    }

    res.json({ message: 'Bottling run deleted successfully' });
  } catch (error) {
    console.error('Error deleting bottling run:', error);
    res.status(500).json({ error: 'Failed to delete bottling run' });
  }
};
