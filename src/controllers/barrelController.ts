import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

// Get all barrels for authenticated user
export const getAllBarrels = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { status, location, barrelType } = req.query;
    const whereClause: any = { userId };

    if (status) whereClause.status = status;
    if (location) whereClause.location = { contains: location as string, mode: 'insensitive' };
    if (barrelType) whereClause.barrelType = barrelType;

    const barrels = await prisma.barrel.findMany({
      where: whereClause,
      include: {
        barrelLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        transfers: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(barrels);
  } catch (error) {
    console.error('Error fetching barrels:', error);
    res.status(500).json({ error: 'Failed to fetch barrels' });
  }
};

// Get single barrel
export const getBarrelById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const barrel = await prisma.barrel.findFirst({
      where: {
        id: req.params.id,
        userId
      },
      include: {
        barrelLogs: {
          orderBy: { createdAt: 'desc' }
        },
        transfers: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!barrel) {
      return res.status(404).json({ error: 'Barrel not found' });
    }

    res.json(barrel);
  } catch (error) {
    console.error('Error fetching barrel:', error);
    res.status(500).json({ error: 'Failed to fetch barrel' });
  }
};

// Create new barrel
export const createBarrel = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      barrelNumber,
      barrelType,
      charLevel,
      toastLevel,
      capacityGallons,
      currentVolumeGallons,
      proof,
      fillDate,
      location,
      status = 'EMPTY',
      notes
    } = req.body;

    const barrel = await prisma.barrel.create({
      data: {
        barrelNumber,
        barrelType,
        charLevel: charLevel ? parseInt(charLevel) : null,
        toastLevel: toastLevel ? parseInt(toastLevel) : null,
        capacityGallons: parseFloat(capacityGallons),
        currentVolumeGallons: currentVolumeGallons ? parseFloat(currentVolumeGallons) : null,
        proof: proof ? parseFloat(proof) : null,
        fillDate: fillDate ? new Date(fillDate) : null,
        location: location || null,
        status,
        notes: notes || null,
        userId
      }
    });

    res.status(201).json(barrel);
  } catch (error) {
    console.error('Error creating barrel:', error);
    res.status(500).json({ error: 'Failed to create barrel' });
  }
};

// Update barrel
export const updateBarrel = async (req: AuthenticatedRequest, res: Response) => {
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
      barrelType,
      charLevel,
      toastLevel,
      capacityGallons,
      currentVolumeGallons,
      proof,
      fillDate,
      dumpDate,
      ageYears,
      location,
      status,
      notes
    } = req.body;

    if (barrelType !== undefined) updateData.barrelType = barrelType;
    if (charLevel !== undefined) updateData.charLevel = charLevel ? parseInt(charLevel) : null;
    if (toastLevel !== undefined) updateData.toastLevel = toastLevel ? parseInt(toastLevel) : null;
    if (capacityGallons !== undefined) updateData.capacityGallons = parseFloat(capacityGallons);
    if (currentVolumeGallons !== undefined) updateData.currentVolumeGallons = currentVolumeGallons ? parseFloat(currentVolumeGallons) : null;
    if (proof !== undefined) updateData.proof = proof ? parseFloat(proof) : null;
    if (fillDate !== undefined) updateData.fillDate = fillDate ? new Date(fillDate) : null;
    if (dumpDate !== undefined) updateData.dumpDate = dumpDate ? new Date(dumpDate) : null;
    if (ageYears !== undefined) updateData.ageYears = ageYears ? parseFloat(ageYears) : null;
    if (location !== undefined) updateData.location = location || null;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes || null;

    const barrel = await prisma.barrel.updateMany({
      where: {
        id: req.params.id,
        userId
      },
      data: updateData
    });

    if (barrel.count === 0) {
      return res.status(404).json({ error: 'Barrel not found' });
    }

    const updatedBarrel = await prisma.barrel.findUnique({
      where: { id: req.params.id }
    });

    res.json(updatedBarrel);
  } catch (error) {
    console.error('Error updating barrel:', error);
    res.status(500).json({ error: 'Failed to update barrel' });
  }
};

// Delete barrel
export const deleteBarrel = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const barrel = await prisma.barrel.deleteMany({
      where: {
        id: req.params.id,
        userId
      }
    });

    if (barrel.count === 0) {
      return res.status(404).json({ error: 'Barrel not found' });
    }

    res.json({ message: 'Barrel deleted successfully' });
  } catch (error) {
    console.error('Error deleting barrel:', error);
    res.status(500).json({ error: 'Failed to delete barrel' });
  }
};

// Get barrel logs
export const getBarrelLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { barrelId } = req.params;
    const { logType, startDate, endDate } = req.query;

    const whereClause: any = {
      barrelId,
      userId
    };

    if (logType) whereClause.logType = logType;
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate as string);
      if (endDate) whereClause.createdAt.lte = new Date(endDate as string);
    }

    const logs = await prisma.barrelLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching barrel logs:', error);
    res.status(500).json({ error: 'Failed to fetch barrel logs' });
  }
};

// Create barrel log
export const createBarrelLog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { barrelId } = req.params;
    const {
      logType,
      volumeGallons,
      proof,
      temperatureFahrenheit,
      notes
    } = req.body;

    const log = await prisma.barrelLog.create({
      data: {
        barrelId,
        logType,
        volumeGallons: volumeGallons ? parseFloat(volumeGallons) : null,
        proof: proof ? parseFloat(proof) : null,
        temperatureFahrenheit: temperatureFahrenheit ? parseFloat(temperatureFahrenheit) : null,
        notes: notes || null,
        userId
      }
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating barrel log:', error);
    res.status(500).json({ error: 'Failed to create barrel log' });
  }
};

// Get barrel inventory summary
export const getBarrelInventory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const [totalBarrels, barrelsByStatus, barrelsByType, totalVolume] = await Promise.all([
      prisma.barrel.count({ where: { userId } }),
      prisma.barrel.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true }
      }),
      prisma.barrel.groupBy({
        by: ['barrelType'],
        where: { userId },
        _count: { barrelType: true }
      }),
      prisma.barrel.aggregate({
        where: { userId },
        _sum: { currentVolumeGallons: true }
      })
    ]);

    res.json({
      totalBarrels,
      barrelsByStatus: barrelsByStatus.map((b: any) => ({
        status: b.status,
        count: b._count.status
      })),
      barrelsByType: barrelsByType.map((b: any) => ({
        type: b.barrelType,
        count: b._count.barrelType
      })),
      totalVolume: totalVolume._sum.currentVolumeGallons || 0
    });
  } catch (error) {
    console.error('Error fetching barrel inventory:', error);
    res.status(500).json({ error: 'Failed to fetch barrel inventory' });
  }
};
