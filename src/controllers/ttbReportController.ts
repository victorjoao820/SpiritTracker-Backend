import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

// Get all TTB reports for authenticated user
export const getAllTTBReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { reportType, status, reportPeriod } = req.query;
    const whereClause: any = { userId };

    if (reportType) whereClause.reportType = reportType;
    if (status) whereClause.status = status;
    if (reportPeriod) whereClause.reportPeriod = reportPeriod;

    const reports = await prisma.tTBReport.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    res.json(reports);
  } catch (error) {
    console.error('Error fetching TTB reports:', error);
    res.status(500).json({ error: 'Failed to fetch TTB reports' });
  }
};

// Get single TTB report
export const getTTBReportById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const report = await prisma.tTBReport.findFirst({
      where: {
        id: req.params.id,
        userId
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'TTB report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching TTB report:', error);
    res.status(500).json({ error: 'Failed to fetch TTB report' });
  }
};

// Create new TTB report
export const createTTBReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      reportType,
      reportPeriod,
      reportDate,
      status = 'DRAFT',
      submittedDate,
      ttbApprovalDate,
      notes
    } = req.body;

    const report = await prisma.tTBReport.create({
      data: {
        reportType,
        reportPeriod,
        reportDate: new Date(reportDate),
        status,
        submittedDate: submittedDate ? new Date(submittedDate) : null,
        ttbApprovalDate: ttbApprovalDate ? new Date(ttbApprovalDate) : null,
        notes: notes || null,
        userId
      }
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating TTB report:', error);
    res.status(500).json({ error: 'Failed to create TTB report' });
  }
};

// Update TTB report
export const updateTTBReport = async (req: AuthenticatedRequest, res: Response) => {
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
      reportType,
      reportPeriod,
      reportDate,
      status,
      submittedDate,
      ttbApprovalDate,
      notes
    } = req.body;

    if (reportType !== undefined) updateData.reportType = reportType;
    if (reportPeriod !== undefined) updateData.reportPeriod = reportPeriod;
    if (reportDate !== undefined) updateData.reportDate = new Date(reportDate);
    if (status !== undefined) updateData.status = status;
    if (submittedDate !== undefined) updateData.submittedDate = submittedDate ? new Date(submittedDate) : null;
    if (ttbApprovalDate !== undefined) updateData.ttbApprovalDate = ttbApprovalDate ? new Date(ttbApprovalDate) : null;
    if (notes !== undefined) updateData.notes = notes || null;

    const report = await prisma.tTBReport.updateMany({
      where: {
        id: req.params.id,
        userId
      },
      data: updateData
    });

    if (report.count === 0) {
      return res.status(404).json({ error: 'TTB report not found' });
    }

    const updatedReport = await prisma.tTBReport.findUnique({
      where: { id: req.params.id }
    });

    res.json(updatedReport);
  } catch (error) {
    console.error('Error updating TTB report:', error);
    res.status(500).json({ error: 'Failed to update TTB report' });
  }
};

// Delete TTB report
export const deleteTTBReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const report = await prisma.tTBReport.deleteMany({
      where: {
        id: req.params.id,
        userId
      }
    });

    if (report.count === 0) {
      return res.status(404).json({ error: 'TTB report not found' });
    }

    res.json({ message: 'TTB report deleted successfully' });
  } catch (error) {
    console.error('Error deleting TTB report:', error);
    res.status(500).json({ error: 'Failed to delete TTB report' });
  }
};

// Generate monthly production report
export const generateMonthlyProductionReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { year, month } = req.params;
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const [
      productionBatches,
      distillationBatches,
      bottlingRuns,
      transfers,
      totalProductionVolume,
      totalDistillationVolume,
      totalBottlingVolume
    ] = await Promise.all([
      prisma.productionBatch.findMany({
        where: {
          userId,
          batchType: 'FERMENTATION',
          startDate: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.productionBatch.findMany({
        where: {
          userId,
          batchType: 'DISTILLATION',
          startDate: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.bottlingRun.findMany({
        where: {
          userId,
          startDate: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.transfer.findMany({
        where: {
          userId,
          transferDate: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.productionBatch.aggregate({
        where: {
          userId,
          batchType: 'FERMENTATION',
          startDate: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: { volumeGallons: true }
      }),
      prisma.productionBatch.aggregate({
        where: {
          userId,
          batchType: 'DISTILLATION',
          startDate: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: { volumeGallons: true }
      }),
      prisma.bottlingRun.aggregate({
        where: {
          userId,
          startDate: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: { volumeGallons: true }
      })
    ]);

    const report = {
      reportPeriod: `${year}-${month.padStart(2, '0')}`,
      reportType: 'MONTHLY_PRODUCTION',
      period: {
        startDate,
        endDate
      },
      production: {
        fermentationBatches: productionBatches.length,
        distillationBatches: distillationBatches.length,
        totalProductionVolume: totalProductionVolume._sum.volumeGallons || 0,
        totalDistillationVolume: totalDistillationVolume._sum.volumeGallons || 0
      },
      bottling: {
        bottlingRuns: bottlingRuns.length,
        totalBottlingVolume: totalBottlingVolume._sum.volumeGallons || 0,
        totalBottles: bottlingRuns.reduce((sum, run) => sum + run.bottlesProduced, 0)
      },
      transfers: {
        totalTransfers: transfers.length,
        inboundTransfers: transfers.filter(t => t.direction === 'INBOUND').length,
        outboundTransfers: transfers.filter(t => t.direction === 'OUTBOUND').length,
        totalTransferVolume: transfers.reduce((sum, t) => sum + Number(t.volumeGallons), 0)
      }
    };

    res.json(report);
  } catch (error) {
    console.error('Error generating monthly production report:', error);
    res.status(500).json({ error: 'Failed to generate monthly production report' });
  }
};

// Generate monthly inventory report
export const generateMonthlyInventoryReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { year, month } = req.params;
    const reportDate = new Date(parseInt(year), parseInt(month) - 1, 1);

    const [
      barrels,
      tanks,
      finishedGoods,
      containers
    ] = await Promise.all([
      prisma.barrel.findMany({
        where: { userId }
      }),
      prisma.tank.findMany({
        where: { userId }
      }),
      prisma.finishedGoods.findMany({
        where: { userId }
      }),
      prisma.container.findMany({
        where: { userId }
      })
    ]);

    const report = {
      reportPeriod: `${year}-${month.padStart(2, '0')}`,
      reportType: 'MONTHLY_INVENTORY',
      reportDate,
      inventory: {
        barrels: {
          total: barrels.length,
          filled: barrels.filter(b => b.status === 'FILLED').length,
          empty: barrels.filter(b => b.status === 'EMPTY').length,
          totalVolume: barrels.reduce((sum, b) => sum + Number(b.currentVolumeGallons || 0), 0)
        },
        tanks: {
          total: tanks.length,
          filled: tanks.filter(t => t.status === 'FILLED').length,
          empty: tanks.filter(t => t.status === 'EMPTY').length,
          totalVolume: tanks.reduce((sum, t) => sum + Number(t.currentVolumeGallons || 0), 0)
        },
        finishedGoods: {
          total: finishedGoods.length,
          inWarehouse: finishedGoods.filter(fg => fg.status === 'IN_WAREHOUSE').length,
          shipped: finishedGoods.filter(fg => fg.status === 'SHIPPED').length,
          totalQuantity: finishedGoods.reduce((sum, fg) => sum + fg.quantity, 0)
        },
        containers: {
          total: containers.length,
          filled: containers.filter(c => !c.isEmpty).length,
          empty: containers.filter(c => c.isEmpty).length,
          totalVolume: containers.reduce((sum, c) => sum + Number(c.volumeGallons), 0)
        }
      }
    };

    res.json(report);
  } catch (error) {
    console.error('Error generating monthly inventory report:', error);
    res.status(500).json({ error: 'Failed to generate monthly inventory report' });
  }
};

// Get TTB report statistics
export const getTTBReportStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const [totalReports, reportsByType, reportsByStatus, recentReports] = await Promise.all([
      prisma.tTBReport.count({ where: { userId } }),
      prisma.tTBReport.groupBy({
        by: ['reportType'],
        where: { userId },
        _count: { reportType: true }
      }),
      prisma.tTBReport.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true }
      }),
      prisma.tTBReport.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    res.json({
      totalReports,
      reportsByType: reportsByType.map(r => ({
        type: r.reportType,
        count: r._count.reportType
      })),
      reportsByStatus: reportsByStatus.map(r => ({
        status: r.status,
        count: r._count.status
      })),
      recentReports
    });
  } catch (error) {
    console.error('Error fetching TTB report stats:', error);
    res.status(500).json({ error: 'Failed to fetch TTB report statistics' });
  }
};
