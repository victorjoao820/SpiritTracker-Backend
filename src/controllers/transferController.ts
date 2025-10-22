import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

// Get all transfers for authenticated user
export const getAllTransfers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { status, transferType, direction, startDate, endDate } = req.query;
    const whereClause: any = { userId };

    if (status) whereClause.status = status;
    if (transferType) whereClause.transferType = transferType;
    if (direction) whereClause.direction = direction;
    if (startDate || endDate) {
      whereClause.transferDate = {};
      if (startDate) whereClause.transferDate.gte = new Date(startDate as string);
      if (endDate) whereClause.transferDate.lte = new Date(endDate as string);
    }

    const transfers = await prisma.transfer.findMany({
      where: whereClause,
      include: {
        barrel: {
          select: {
            id: true,
            barrelNumber: true,
            barrelType: true,
            capacityGallons: true
          }
        },
        container: {
          select: {
            id: true,
            type: true,
            netWeight: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(transfers);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
};

// Get single transfer
export const getTransferById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const transfer = await prisma.transfer.findFirst({
      where: {
        id: req.params.id,
        userId
      },
      include: {
        barrel: {
          select: {
            id: true,
            barrelNumber: true,
            barrelType: true,
            capacityGallons: true
          }
        },
        container: {
          select: {
            id: true,
            type: true,
            netWeight: true
          }
        }
      }
    });

    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    res.json(transfer);
  } catch (error) {
    console.error('Error fetching transfer:', error);
    res.status(500).json({ error: 'Failed to fetch transfer' });
  }
};

// Create new transfer
export const createTransfer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      transferNumber,
      transferType,
      direction,
      barrelId,
      containerId,
      volumeGallons,
      proof,
      temperatureFahrenheit,
      transferDate,
      destination,
      carrier,
      sealNumber,
      status = 'PENDING',
      notes
    } = req.body;

    const transfer = await prisma.transfer.create({
      data: {
        transferNumber,
        transferType,
        direction,
        barrelId: barrelId || null,
        containerId: containerId || null,
        volumeGallons: parseFloat(volumeGallons),
        proof: parseFloat(proof),
        temperatureFahrenheit: temperatureFahrenheit ? parseFloat(temperatureFahrenheit) : null,
        transferDate: new Date(transferDate),
        destination: destination || null,
        carrier: carrier || null,
        sealNumber: sealNumber || null,
        status,
        notes: notes || null,
        userId
      },
      include: {
        barrel: {
          select: {
            id: true,
            barrelNumber: true,
            barrelType: true,
            capacityGallons: true
          }
        },
        container: {
          select: {
            id: true,
            type: true,
            netWeight: true
          }
        }
      }
    });

    res.status(201).json(transfer);
  } catch (error) {
    console.error('Error creating transfer:', error);
    res.status(500).json({ error: 'Failed to create transfer' });
  }
};

// Update transfer
export const updateTransfer = async (req: AuthenticatedRequest, res: Response) => {
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
      transferNumber,
      transferType,
      direction,
      barrelId,
      containerId,
      volumeGallons,
      proof,
      temperatureFahrenheit,
      transferDate,
      destination,
      carrier,
      sealNumber,
      status,
      notes
    } = req.body;

    if (transferNumber !== undefined) updateData.transferNumber = transferNumber;
    if (transferType !== undefined) updateData.transferType = transferType;
    if (direction !== undefined) updateData.direction = direction;
    if (barrelId !== undefined) updateData.barrelId = barrelId || null;
    if (containerId !== undefined) updateData.containerId = containerId || null;
    if (volumeGallons !== undefined) updateData.volumeGallons = parseFloat(volumeGallons);
    if (proof !== undefined) updateData.proof = parseFloat(proof);
    if (temperatureFahrenheit !== undefined) updateData.temperatureFahrenheit = temperatureFahrenheit ? parseFloat(temperatureFahrenheit) : null;
    if (transferDate !== undefined) updateData.transferDate = new Date(transferDate);
    if (destination !== undefined) updateData.destination = destination || null;
    if (carrier !== undefined) updateData.carrier = carrier || null;
    if (sealNumber !== undefined) updateData.sealNumber = sealNumber || null;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes || null;

    const transfer = await prisma.transfer.updateMany({
      where: {
        id: req.params.id,
        userId
      },
      data: updateData
    });

    if (transfer.count === 0) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    const updatedTransfer = await prisma.transfer.findUnique({
      where: { id: req.params.id },
      include: {
        barrel: {
          select: {
            id: true,
            barrelNumber: true,
            barrelType: true,
            capacityGallons: true
          }
        },
        container: {
          select: {
            id: true,
            type: true,
            netWeight: true
          }
        }
      }
    });

    res.json(updatedTransfer);
  } catch (error) {
    console.error('Error updating transfer:', error);
    res.status(500).json({ error: 'Failed to update transfer' });
  }
};

// Delete transfer
export const deleteTransfer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const transfer = await prisma.transfer.deleteMany({
      where: {
        id: req.params.id,
        userId
      }
    });

    if (transfer.count === 0) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    res.json({ message: 'Transfer deleted successfully' });
  } catch (error) {
    console.error('Error deleting transfer:', error);
    res.status(500).json({ error: 'Failed to delete transfer' });
  }
};

// Get transfer summary/statistics
export const getTransferStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { startDate, endDate } = req.query;
    
    const whereClause: any = {
      userId
    };

    if (startDate || endDate) {
      whereClause.transferDate = {};
      if (startDate) whereClause.transferDate.gte = new Date(startDate as string);
      if (endDate) whereClause.transferDate.lte = new Date(endDate as string);
    }

    const [
      totalTransfers,
      transfersByType,
      transfersByDirection,
      transfersByStatus,
      totalVolume
    ] = await Promise.all([
      prisma.transfer.count({ where: whereClause }),
      prisma.transfer.groupBy({
        by: ['transferType'],
        where: whereClause,
        _count: { transferType: true }
      }),
      prisma.transfer.groupBy({
        by: ['direction'],
        where: whereClause,
        _count: { direction: true }
      }),
      prisma.transfer.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { status: true }
      }),
      prisma.transfer.aggregate({
        where: whereClause,
        _sum: { volumeGallons: true }
      })
    ]);

    res.json({
      totalTransfers,
      transfersByType: transfersByType.map((t: any) => ({
        type: t.transferType,
        count: t._count.transferType
      })),
      transfersByDirection: transfersByDirection.map((t: any) => ({
        direction: t.direction,
        count: t._count.direction
      })),
      transfersByStatus: transfersByStatus.map((t: any) => ({
        status: t.status,
        count: t._count.status
      })),
      totalVolume: totalVolume._sum.volumeGallons || 0
    });
  } catch (error) {
    console.error('Error fetching transfer stats:', error);
    res.status(500).json({ error: 'Failed to fetch transfer statistics' });
  }
};
