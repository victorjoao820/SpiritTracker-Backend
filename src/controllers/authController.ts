import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../models/user';
import { prisma } from '../lib/prisma';
import jwtService from '../services/jwtService';

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password }: AuthRequest = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const tokens = jwtService.generateTokenPair(tokenPayload);
    
    res.status(201).json({
      message: 'User created successfully',
      user,
      tokens
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
    };
    
    const tokens = jwtService.generateTokenPair(tokenPayload);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      },
      tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
