import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

// Get all outbound transfers for authenticated user
export const getAllTransferOutbound = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const transfers = await prisma.transfer.findMany({
      where: {
        userId,
        direction: 'OUTBOUND'
      },
      include: {
        container: {
          select: {
            id: true,
            name: true,
            type: true,
            netWeight: true,
            containerKind: {
              select: {
                id: true,
                name: true,
                capacityGallons: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate next transfer number from ALL transfers (transferNumber is global auto-increment)
    // Get the maximum transferNumber from all transfers (not just OUTBOUND)
    let nextTransferNumber = 1;
    const allTransfers = await prisma.transfer.findMany({
      where: { userId },
      select: { transferNumber: true },
      orderBy: { transferNumber: 'desc' }
    });

    if (allTransfers && allTransfers.length > 0) {
      // Find the maximum numeric value from all transferNumbers
      const maxNumber = allTransfers.reduce((max, t) => {
        if (!t.transferNumber) return max;
        // Extract numeric part from transferNumber (handle formats like "TOB-1", "1", etc.)
        const numMatch = t.transferNumber.toString().match(/\d+/);
        const num = numMatch ? parseInt(numMatch[0], 10) : 0;
        return Math.max(max, num);
      }, 0);
      nextTransferNumber = maxNumber + 1;
    }

    res.json({
      transfers,
      nextTransferNumber
    });
  } catch (error) {
    console.error('Error fetching outbound transfers:', error);
    res.status(500).json({ error: 'Failed to fetch outbound transfers' });
  }
};

// Get single outbound transfer
export const getTransferOutboundById = async (req: AuthenticatedRequest, res: Response) => {
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
        userId,
        direction: 'OUTBOUND'
      },
      include: {
        container: {
          select: {
            id: true,
            name: true,
            type: true,
            netWeight: true,
            containerKind: {
              select: {
                id: true,
                name: true,
                capacityGallons: true
              }
            }
          }
        }
      }
    });

    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    res.json(transfer);
  } catch (error) {
    console.error('Error fetching outbound transfer:', error);
    res.status(500).json({ error: 'Failed to fetch outbound transfer' });
  }
};

// Create outbound transfer
export const createTransferOutbound = async (req: AuthenticatedRequest, res: Response) => {
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
      transferType = 'CONTAINER',
      containerId,
      volumeGallons,
      proof = 0,
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
        direction: 'OUTBOUND',
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
        container: {
          select: {
            id: true,
            name: true,
            type: true,
            netWeight: true,
            containerKind: {
              select: {
                id: true,
                name: true,
                capacityGallons: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(transfer);
  } catch (error) {
    console.error('Error creating transfer outbound:', error);
    res.status(500).json({ error: 'Failed to create transfer outbound' });
  }
};

// Update outbound transfer
export const updateTransferOutbound = async (req: AuthenticatedRequest, res: Response) => {
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

    const transfer = await prisma.transfer.findFirst({
      where: {
        id: req.params.id,
        userId,
        direction: 'OUTBOUND'
      }
    });

    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    const updatedTransfer = await prisma.transfer.update({
      where: { id: req.params.id },
      data: {
        ...(transferNumber && { transferNumber }),
        ...(transferType && { transferType }),
        ...(containerId !== undefined && { containerId: containerId || null }),
        ...(volumeGallons !== undefined && { volumeGallons: parseFloat(volumeGallons) }),
        ...(proof !== undefined && { proof: parseFloat(proof) }),
        ...(temperatureFahrenheit !== undefined && { temperatureFahrenheit: temperatureFahrenheit ? parseFloat(temperatureFahrenheit) : null }),
        ...(transferDate && { transferDate: new Date(transferDate) }),
        ...(destination !== undefined && { destination: destination || null }),
        ...(carrier !== undefined && { carrier: carrier || null }),
        ...(sealNumber !== undefined && { sealNumber: sealNumber || null }),
        ...(status && { status }),
        ...(notes !== undefined && { notes: notes || null })
      },
      include: {
        container: {
          select: {
            id: true,
            name: true,
            type: true,
            netWeight: true,
            containerKind: {
              select: {
                id: true,
                name: true,
                capacityGallons: true
              }
            }
          }
        }
      }
    });

    res.json(updatedTransfer);
  } catch (error) {
    console.error('Error updating transfer outbound:', error);
    res.status(500).json({ error: 'Failed to update transfer outbound' });
  }
};

// Delete outbound transfer
export const deleteTransferOutbound = async (req: AuthenticatedRequest, res: Response) => {
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
        userId,
        direction: 'OUTBOUND'
      }
    });

    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    await prisma.transfer.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Transfer deleted successfully' });
  } catch (error) {
    console.error('Error deleting transfer outbound:', error);
    res.status(500).json({ error: 'Failed to delete transfer outbound' });
  }
};

