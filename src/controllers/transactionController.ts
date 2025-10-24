import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

// Get all transactions for authenticated user
export const getAllTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { page = '1', limit = '50', type, containerId, startDate, endDate } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const whereClause: any = {
      userId
    };

    if (type) whereClause.transactionType = type;
    if (containerId) whereClause.containerId = containerId;
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate as string);
      if (endDate) whereClause.createdAt.lte = new Date(endDate as string);
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        container: {
          select: {
            id: true,
            type: true,
            netWeight: true
          }
        },
        fermentation: {
          select: {
            id: true,
            batchNumber: true,
            status: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string)
    });

    const total = await prisma.transaction.count({
      where: whereClause
    });

    res.json({
      transactions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Get single transaction
export const getTransactionById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: req.params.id,
        userId
      },
      include: {
        container: {
          select: {
            id: true,
            type: true,
            netWeight: true
          }
        },
        fermentation: {
          select: {
            id: true,
            batchNumber: true,
            status: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};

// Create new transaction
export const createTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      transactionType,
      containerId,
      fermentationId,
      productId,
      volumeGallons,
      proof,
      temperatureFahrenheit,
      notes,
      metadata
    } = req.body;

    const transaction = await prisma.transaction.create({
      data: {
        transactionType,
        containerId: containerId || null,
        fermentationId: fermentationId || null,
        productId: productId || null,
        volumeGallons: volumeGallons ? parseFloat(volumeGallons) : null,
        proof: proof ? parseFloat(proof) : null,
        temperatureFahrenheit: temperatureFahrenheit ? parseFloat(temperatureFahrenheit) : null,
        notes: notes || null,
        metadata: metadata || null,
        userId
      },
      include: {
        container: {
          select: {
            id: true,
            type: true,
            netWeight: true
          }
        },
        fermentation: {
          select: {
            id: true,
            batchNumber: true,
            status: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// Get transaction summary/statistics
export const getTransactionStats = async (req: AuthenticatedRequest, res: Response) => {
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
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate as string);
      if (endDate) whereClause.createdAt.lte = new Date(endDate as string);
    }

    const [
      totalTransactions,
      transactionsByType,
      recentTransactions
    ] = await Promise.all([
      prisma.transaction.count({ where: whereClause }),
      prisma.transaction.groupBy({
        by: ['transactionType'],
        where: whereClause,
        _count: {
          transactionType: true
        }
      }),
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          transactionType: true,
          createdAt: true,
          volumeGallons: true,
          container: {
            select: {
              type: true
            }
          }
        }
      })
    ]);

    res.json({
      totalTransactions,
      transactionsByType: transactionsByType.map(t => ({
        type: t.transactionType,
        count: t._count.transactionType
      })),
      recentTransactions
    });
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({ error: 'Failed to fetch transaction statistics' });
  }
};
