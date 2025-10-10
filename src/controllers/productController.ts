import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

// Get all products for authenticated user
export const getAllProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const products = await prisma.product.findMany({
      where: { userId: req.user?.userId },
      orderBy: { name: 'asc' }
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get single product
export const getProductById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const product = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        userId
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Create new product
export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { name, description } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        userId
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// Update product
export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { name, description } = req.body;

    const product = await prisma.product.updateMany({
      where: {
        id: req.params.id,
        userId
      },
      data: {
        name,
        description: description || ''
      }
    });

    if (product.count === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = await prisma.product.findUnique({
      where: { id: req.params.id }
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Delete product
export const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const product = await prisma.product.deleteMany({
      where: {
        id: req.params.id,
        userId
      }
    });

    if (product.count === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// Bulk create products (for seeding default products)
export const bulkCreateProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { products } = req.body;

    const createdProducts = await prisma.product.createMany({
      data: products.map((product: any) => ({
        name: product.name,
        description: product.description || '',
        userId
      })),
      skipDuplicates: true
    });

    res.status(201).json({
      message: `${createdProducts.count} products created successfully`,
      count: createdProducts.count
    });
  } catch (error) {
    console.error('Error bulk creating products:', error);
    res.status(500).json({ error: 'Failed to create products' });
  }
};
