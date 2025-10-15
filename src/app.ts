import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import containerRoutes from './routes/containers';
import containerOperationRoutes from './routes/containerOperations';
import productionRoutes from './routes/production';
import transactionRoutes from './routes/transactions';
import barrelRoutes from './routes/barrels';
import batchingRoutes from './routes/batching';
import transferRoutes from './routes/transfers';
import finishedGoodsRoutes from './routes/finishedGoods';
import tankRoutes from './routes/tanks';
import ttbReportRoutes from './routes/ttbReports';

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://spirit-tracker-frontend.s3-website-us-east-1.amazonaws.com']
    : [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://localhost:4200',
        'http://localhost:8080'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ]
};

// Apply CORS middleware
app.use(cors(corsOptions));
// Parse JSON bodies for all other routes
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/containers', containerRoutes);
app.use('/api/container-operations', containerOperationRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/barrels', barrelRoutes);
app.use('/api/batching', batchingRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/finished-goods', finishedGoodsRoutes);
app.use('/api/tanks', tankRoutes);
app.use('/api/ttb-reports', ttbReportRoutes);


// Root endpoint for basic health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Whiskey Production System API is running',
    timestamp: new Date().toISOString(),
    documentation: '/api-docs'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler (should be after routes)
// app.use(errorHandler);

export default app;
