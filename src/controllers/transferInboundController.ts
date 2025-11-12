import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

// Get all inbound transfers for authenticated user
export const getAllTransferInbound = async (req: AuthenticatedRequest, res: Response) => {
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
        direction: 'INBOUND'
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
    // Get the maximum transferNumber from all transfers (not just INBOUND)
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
        // Extract numeric part from transferNumber (handle formats like "TIB-1", "1", etc.)
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
    console.error('Error fetching inbound transfers:', error);
    res.status(500).json({ error: 'Failed to fetch inbound transfers' });
  }
};

// Get single inbound transfer
export const getTransferInboundById = async (req: AuthenticatedRequest, res: Response) => {
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
        direction: 'INBOUND'
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
      return res.status(404).json({ error: 'Transfer inbound not found' });
    }

    res.json(transfer);
  } catch (error) {
    console.error('Error fetching transfer inbound:', error);
    res.status(500).json({ error: 'Failed to fetch transfer inbound' });
  }
};

// Create inbound transfer
export const createTransferInbound = async (req: AuthenticatedRequest, res: Response) => {
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
        direction: 'INBOUND',
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
    console.error('Error creating transfer inbound:', error);
    res.status(500).json({ error: 'Failed to create transfer inbound' });
  }
};

// Update inbound transfer
export const updateTransferInbound = async (req: AuthenticatedRequest, res: Response) => {
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
        userId,
        direction: 'INBOUND'
      },
      data: updateData
    });

    if (transfer.count === 0) {
      return res.status(404).json({ error: 'Transfer inbound not found' });
    }

    const updatedTransfer = await prisma.transfer.findUnique({
      where: { id: req.params.id },
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
    console.error('Error updating transfer inbound:', error);
    res.status(500).json({ error: 'Failed to update transfer inbound' });
  }
};

// Delete inbound transfer
export const deleteTransferInbound = async (req: AuthenticatedRequest, res: Response) => {
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
        userId,
        direction: 'INBOUND'
      }
    });

    if (transfer.count === 0) {
      return res.status(404).json({ error: 'Transfer inbound not found' });
    }

    res.json({ message: 'Transfer inbound deleted successfully' });
  } catch (error) {
    console.error('Error deleting transfer inbound:', error);
    res.status(500).json({ error: 'Failed to delete transfer inbound' });
  }
};

