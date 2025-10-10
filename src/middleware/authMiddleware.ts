import { Request, Response, NextFunction } from 'express';
import jwtService from '../services/jwtService';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
    });
  }

  const decoded = jwtService.verifyToken(token);
  if (!decoded) {
    return res.status(401).json({  // Changed from 403 to 401
      success: false,
      message: 'Invalid or expired token',
    });
  }

  req.user = decoded;
  next();
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = jwtService.verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
}; 