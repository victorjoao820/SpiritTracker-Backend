import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

// Get all finished goods for authenticated user
export const getAllFinishedGoods = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { status, productId, location } = req.query;
    const whereClause: any = { userId };

    if (status) whereClause.status = status;
    if (productId) whereClause.productId = productId;
    if (location) whereClause.location = { contains: location as string, mode: 'insensitive' };

    const finishedGoods = await prisma.finishedGoods.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        bailmentDepletions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(finishedGoods);
  } catch (error) {
    console.error('Error fetching finished goods:', error);
    res.status(500).json({ error: 'Failed to fetch finished goods' });
  }
};

// Get single finished goods
export const getFinishedGoodsById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const finishedGoods = await prisma.finishedGoods.findFirst({
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
        bailmentDepletions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!finishedGoods) {
      return res.status(404).json({ error: 'Finished goods not found' });
    }

    res.json(finishedGoods);
  } catch (error) {
    console.error('Error fetching finished goods:', error);
    res.status(500).json({ error: 'Failed to fetch finished goods' });
  }
};

// Create new finished goods
export const createFinishedGoods = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      productId,
      batchNumber,
      bottleSize,
      quantity,
      proof,
      location,
      status = 'IN_WAREHOUSE',
      receivedDate,
      shippedDate,
      notes
    } = req.body;

    const finishedGoods = await prisma.finishedGoods.create({
      data: {
        productId: productId || null,
        batchNumber: batchNumber || null,
        bottleSize: parseFloat(bottleSize),
        quantity: parseInt(quantity),
        proof: parseFloat(proof),
        location: location || null,
        status,
        receivedDate: receivedDate ? new Date(receivedDate) : null,
        shippedDate: shippedDate ? new Date(shippedDate) : null,
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

    res.status(201).json(finishedGoods);
  } catch (error) {
    console.error('Error creating finished goods:', error);
    res.status(500).json({ error: 'Failed to create finished goods' });
  }
};

// Update finished goods
export const updateFinishedGoods = async (req: AuthenticatedRequest, res: Response) => {
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
      productId,
      batchNumber,
      bottleSize,
      quantity,
      proof,
      location,
      status,
      receivedDate,
      shippedDate,
      notes
    } = req.body;

    if (productId !== undefined) updateData.productId = productId || null;
    if (batchNumber !== undefined) updateData.batchNumber = batchNumber || null;
    if (bottleSize !== undefined) updateData.bottleSize = parseFloat(bottleSize);
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (proof !== undefined) updateData.proof = parseFloat(proof);
    if (location !== undefined) updateData.location = location || null;
    if (status !== undefined) updateData.status = status;
    if (receivedDate !== undefined) updateData.receivedDate = receivedDate ? new Date(receivedDate) : null;
    if (shippedDate !== undefined) updateData.shippedDate = shippedDate ? new Date(shippedDate) : null;
    if (notes !== undefined) updateData.notes = notes || null;

    const finishedGoods = await prisma.finishedGoods.updateMany({
      where: {
        id: req.params.id,
        userId
      },
      data: updateData
    });

    if (finishedGoods.count === 0) {
      return res.status(404).json({ error: 'Finished goods not found' });
    }

    const updatedFinishedGoods = await prisma.finishedGoods.findUnique({
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

    res.json(updatedFinishedGoods);
  } catch (error) {
    console.error('Error updating finished goods:', error);
    res.status(500).json({ error: 'Failed to update finished goods' });
  }
};

// Delete finished goods
export const deleteFinishedGoods = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const finishedGoods = await prisma.finishedGoods.deleteMany({
      where: {
        id: req.params.id,
        userId
      }
    });

    if (finishedGoods.count === 0) {
      return res.status(404).json({ error: 'Finished goods not found' });
    }

    res.json({ message: 'Finished goods deleted successfully' });
  } catch (error) {
    console.error('Error deleting finished goods:', error);
    res.status(500).json({ error: 'Failed to delete finished goods' });
  }
};

// Get all bailment depletions for authenticated user
export const getAllBailmentDepletions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { depletionType, productId, finishedGoodsId, startDate, endDate } = req.query;
    const whereClause: any = { userId };

    if (depletionType) whereClause.depletionType = depletionType;
    if (productId) whereClause.productId = productId;
    if (finishedGoodsId) whereClause.finishedGoodsId = finishedGoodsId;
    if (startDate || endDate) {
      whereClause.depletionDate = {};
      if (startDate) whereClause.depletionDate.gte = new Date(startDate as string);
      if (endDate) whereClause.depletionDate.lte = new Date(endDate as string);
    }

    const depletions = await prisma.bailmentDepletion.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        finishedGoods: {
          select: {
            id: true,
            batchNumber: true,
            bottleSize: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(depletions);
  } catch (error) {
    console.error('Error fetching bailment depletions:', error);
    res.status(500).json({ error: 'Failed to fetch bailment depletions' });
  }
};

// Get single bailment depletion
export const getBailmentDepletionById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const depletion = await prisma.bailmentDepletion.findFirst({
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
        finishedGoods: {
          select: {
            id: true,
            batchNumber: true,
            bottleSize: true
          }
        }
      }
    });

    if (!depletion) {
      return res.status(404).json({ error: 'Bailment depletion not found' });
    }

    res.json(depletion);
  } catch (error) {
    console.error('Error fetching bailment depletion:', error);
    res.status(500).json({ error: 'Failed to fetch bailment depletion' });
  }
};

// Create new bailment depletion
export const createBailmentDepletion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      finishedGoodsId,
      productId,
      depletionType,
      quantity,
      depletionDate,
      reason,
      notes
    } = req.body;

    const depletion = await prisma.bailmentDepletion.create({
      data: {
        finishedGoodsId: finishedGoodsId || null,
        productId: productId || null,
        depletionType,
        quantity: parseInt(quantity),
        depletionDate: new Date(depletionDate),
        reason: reason || null,
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
        finishedGoods: {
          select: {
            id: true,
            batchNumber: true,
            bottleSize: true
          }
        }
      }
    });

    res.status(201).json(depletion);
  } catch (error) {
    console.error('Error creating bailment depletion:', error);
    res.status(500).json({ error: 'Failed to create bailment depletion' });
  }
};

// Update bailment depletion
export const updateBailmentDepletion = async (req: AuthenticatedRequest, res: Response) => {
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
      finishedGoodsId,
      productId,
      depletionType,
      quantity,
      depletionDate,
      reason,
      notes
    } = req.body;

    if (finishedGoodsId !== undefined) updateData.finishedGoodsId = finishedGoodsId || null;
    if (productId !== undefined) updateData.productId = productId || null;
    if (depletionType !== undefined) updateData.depletionType = depletionType;
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (depletionDate !== undefined) updateData.depletionDate = new Date(depletionDate);
    if (reason !== undefined) updateData.reason = reason || null;
    if (notes !== undefined) updateData.notes = notes || null;

    const depletion = await prisma.bailmentDepletion.updateMany({
      where: {
        id: req.params.id,
        userId
      },
      data: updateData
    });

    if (depletion.count === 0) {
      return res.status(404).json({ error: 'Bailment depletion not found' });
    }

    const updatedDepletion = await prisma.bailmentDepletion.findUnique({
      where: { id: req.params.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        finishedGoods: {
          select: {
            id: true,
            batchNumber: true,
            bottleSize: true
          }
        }
      }
    });

    res.json(updatedDepletion);
  } catch (error) {
    console.error('Error updating bailment depletion:', error);
    res.status(500).json({ error: 'Failed to update bailment depletion' });
  }
};

// Delete bailment depletion
export const deleteBailmentDepletion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const depletion = await prisma.bailmentDepletion.deleteMany({
      where: {
        id: req.params.id,
        userId
      }
    });

    if (depletion.count === 0) {
      return res.status(404).json({ error: 'Bailment depletion not found' });
    }

    res.json({ message: 'Bailment depletion deleted successfully' });
  } catch (error) {
    console.error('Error deleting bailment depletion:', error);
    res.status(500).json({ error: 'Failed to delete bailment depletion' });
  }
};

// Get finished goods inventory summary
export const getFinishedGoodsInventory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const [totalItems, itemsByStatus, totalQuantity, totalValue] = await Promise.all([
      prisma.finishedGoods.count({ where: { userId } }),
      prisma.finishedGoods.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true }
      }),
      prisma.finishedGoods.aggregate({
        where: { userId },
        _sum: { quantity: true }
      }),
      prisma.finishedGoods.groupBy({
        by: ['productId'],
        where: { userId },
        _sum: { quantity: true }
      })
    ]);

    res.json({
      totalItems,
      itemsByStatus: itemsByStatus.map((i: any) => ({
        status: i.status,
        count: i._count.status
      })),
      totalQuantity: totalQuantity._sum.quantity || 0,
      totalValue: totalValue.length // This would need more complex calculation for actual value
    });
  } catch (error) {
    console.error('Error fetching finished goods inventory:', error);
    res.status(500).json({ error: 'Failed to fetch finished goods inventory' });
  }
};
