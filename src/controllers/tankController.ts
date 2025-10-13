import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

// Get all tanks for authenticated user
export const getAllTanks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { status, tankType, location } = req.query;
    const whereClause: any = { userId };

    if (status) whereClause.status = status;
    if (tankType) whereClause.tankType = tankType;
    if (location) whereClause.location = { contains: location as string, mode: 'insensitive' };

    const tanks = await prisma.tank.findMany({
      where: whereClause,
      include: {
        tankLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tanks);
  } catch (error) {
    console.error('Error fetching tanks:', error);
    res.status(500).json({ error: 'Failed to fetch tanks' });
  }
};

// Get single tank
export const getTankById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const tank = await prisma.tank.findFirst({
      where: {
        id: req.params.id,
        userId
      },
      include: {
        tankLogs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!tank) {
      return res.status(404).json({ error: 'Tank not found' });
    }

    res.json(tank);
  } catch (error) {
    console.error('Error fetching tank:', error);
    res.status(500).json({ error: 'Failed to fetch tank' });
  }
};

// Create new tank
export const createTank = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      tankNumber,
      tankType,
      capacityGallons,
      currentVolumeGallons,
      proof,
      temperatureFahrenheit,
      status = 'EMPTY',
      location,
      notes
    } = req.body;

    const tank = await prisma.tank.create({
      data: {
        tankNumber,
        tankType,
        capacityGallons: parseFloat(capacityGallons),
        currentVolumeGallons: currentVolumeGallons ? parseFloat(currentVolumeGallons) : null,
        proof: proof ? parseFloat(proof) : null,
        temperatureFahrenheit: temperatureFahrenheit ? parseFloat(temperatureFahrenheit) : null,
        status,
        location: location || null,
        notes: notes || null,
        userId
      }
    });

    res.status(201).json(tank);
  } catch (error) {
    console.error('Error creating tank:', error);
    res.status(500).json({ error: 'Failed to create tank' });
  }
};

// Update tank
export const updateTank = async (req: AuthenticatedRequest, res: Response) => {
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
      tankNumber,
      tankType,
      capacityGallons,
      currentVolumeGallons,
      proof,
      temperatureFahrenheit,
      status,
      location,
      notes
    } = req.body;

    if (tankNumber !== undefined) updateData.tankNumber = tankNumber;
    if (tankType !== undefined) updateData.tankType = tankType;
    if (capacityGallons !== undefined) updateData.capacityGallons = parseFloat(capacityGallons);
    if (currentVolumeGallons !== undefined) updateData.currentVolumeGallons = currentVolumeGallons ? parseFloat(currentVolumeGallons) : null;
    if (proof !== undefined) updateData.proof = proof ? parseFloat(proof) : null;
    if (temperatureFahrenheit !== undefined) updateData.temperatureFahrenheit = temperatureFahrenheit ? parseFloat(temperatureFahrenheit) : null;
    if (status !== undefined) updateData.status = status;
    if (location !== undefined) updateData.location = location || null;
    if (notes !== undefined) updateData.notes = notes || null;

    const tank = await prisma.tank.updateMany({
      where: {
        id: req.params.id,
        userId
      },
      data: updateData
    });

    if (tank.count === 0) {
      return res.status(404).json({ error: 'Tank not found' });
    }

    const updatedTank = await prisma.tank.findUnique({
      where: { id: req.params.id }
    });

    res.json(updatedTank);
  } catch (error) {
    console.error('Error updating tank:', error);
    res.status(500).json({ error: 'Failed to update tank' });
  }
};

// Delete tank
export const deleteTank = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const tank = await prisma.tank.deleteMany({
      where: {
        id: req.params.id,
        userId
      }
    });

    if (tank.count === 0) {
      return res.status(404).json({ error: 'Tank not found' });
    }

    res.json({ message: 'Tank deleted successfully' });
  } catch (error) {
    console.error('Error deleting tank:', error);
    res.status(500).json({ error: 'Failed to delete tank' });
  }
};

// Get tank logs
export const getTankLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { tankId } = req.params;
    const { logType, startDate, endDate } = req.query;

    const whereClause: any = {
      tankId,
      userId
    };

    if (logType) whereClause.logType = logType;
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate as string);
      if (endDate) whereClause.createdAt.lte = new Date(endDate as string);
    }

    const logs = await prisma.tankLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching tank logs:', error);
    res.status(500).json({ error: 'Failed to fetch tank logs' });
  }
};

// Create tank log
export const createTankLog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { tankId } = req.params;
    const {
      logType,
      volumeGallons,
      proof,
      temperatureFahrenheit,
      action,
      notes
    } = req.body;

    const log = await prisma.tankLog.create({
      data: {
        tankId,
        logType,
        volumeGallons: volumeGallons ? parseFloat(volumeGallons) : null,
        proof: proof ? parseFloat(proof) : null,
        temperatureFahrenheit: temperatureFahrenheit ? parseFloat(temperatureFahrenheit) : null,
        action: action || null,
        notes: notes || null,
        userId
      }
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating tank log:', error);
    res.status(500).json({ error: 'Failed to create tank log' });
  }
};

// Get tank inventory summary
export const getTankInventory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const [totalTanks, tanksByStatus, tanksByType, totalVolume, totalCapacity] = await Promise.all([
      prisma.tank.count({ where: { userId } }),
      prisma.tank.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true }
      }),
      prisma.tank.groupBy({
        by: ['tankType'],
        where: { userId },
        _count: { tankType: true }
      }),
      prisma.tank.aggregate({
        where: { userId },
        _sum: { currentVolumeGallons: true }
      }),
      prisma.tank.aggregate({
        where: { userId },
        _sum: { capacityGallons: true }
      })
    ]);

    const totalVolumeValue = totalVolume._sum.currentVolumeGallons ? Number(totalVolume._sum.currentVolumeGallons) : 0;
    const totalCapacityValue = totalCapacity._sum.capacityGallons ? Number(totalCapacity._sum.capacityGallons) : 0;

    res.json({
      totalTanks,
      tanksByStatus: tanksByStatus.map((t: any) => ({
        status: t.status,
        count: t._count.status
      })),
      tanksByType: tanksByType.map((t: any) => ({
        type: t.tankType,
        count: t._count.tankType
      })),
      totalVolume: totalVolumeValue,
      totalCapacity: totalCapacityValue,
      utilizationRate: totalCapacityValue > 0 
        ? (totalVolumeValue / totalCapacityValue) * 100 
        : 0
    });
  } catch (error) {
    console.error('Error fetching tank inventory:', error);
    res.status(500).json({ error: 'Failed to fetch tank inventory' });
  }
};
