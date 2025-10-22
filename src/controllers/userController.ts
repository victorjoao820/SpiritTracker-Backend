import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// Get user profile
export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Update user profile
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: req.user?.userId }
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const user = await prisma.user.update({
      where: { id: req.user?.userId },
      data: { email },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

// Get user dashboard statistics
export const getUserDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const [
      totalProducts,
      totalContainers,
      totalProductionBatches,
      totalTransactions,
      recentTransactions,
      containersByType
    ] = await Promise.all([
      prisma.product.count({ where: { userId } }),
      prisma.container.count({ where: { userId } }),
      prisma.productionBatch.count({ where: { userId } }),
      prisma.transaction.count({ where: { userId } }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          container: {
            select: {
              type: true
            }
          },
          product: {
            select: {
              name: true
            }
          }
        }
      }),
      prisma.container.groupBy({
        by: ['type'],
        where: { userId },
        _count: {
          type: true
        }
      })
    ]);

    res.json({
      stats: {
        totalProducts,
        totalContainers,
        totalProductionBatches,
        totalTransactions
      },
      recentTransactions,
      containersByType: containersByType.map(c => ({
        type: c.type,
        count: c._count?.type || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};
