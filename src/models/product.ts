// Product-related model types based on Prisma schema

// Enums
export enum ContainerType {
  WOODEN_BARREL = 'WOODEN_BARREL',
  METAL_DRUM = 'METAL_DRUM',
  SQUARE_TANK = 'SQUARE_TANK',
  TOTE = 'TOTE',
  FIVE_GALLON_TOTE = 'FIVE_GALLON_TOTE',
  STILL = 'STILL',
  FERMENTER = 'FERMENTER'
}

export enum BatchType {
  FERMENTATION = 'FERMENTATION',
  DISTILLATION = 'DISTILLATION'
}

export enum TransactionType {
  CREATE_EMPTY_CONTAINER = 'CREATE_EMPTY_CONTAINER',
  CREATE_FILLED_CONTAINER = 'CREATE_FILLED_CONTAINER',
  DELETE_EMPTY_CONTAINER = 'DELETE_EMPTY_CONTAINER',
  DELETE_FILLED_CONTAINER = 'DELETE_FILLED_CONTAINER',
  EDIT_EMPTY_DATA_CORRECTION = 'EDIT_EMPTY_DATA_CORRECTION',
  EDIT_FILL_DATA_CORRECTION = 'EDIT_FILL_DATA_CORRECTION',
  EDIT_FILL_FROM_EMPTY = 'EDIT_FILL_FROM_EMPTY',
  EDIT_EMPTY_FROM_FILLED = 'EDIT_EMPTY_FROM_FILLED',
  REFILL_CONTAINER = 'REFILL_CONTAINER',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  PRODUCTION = 'PRODUCTION',
  DISTILLATION_FINISH = 'DISTILLATION_FINISH',
  SAMPLE_ADJUST = 'SAMPLE_ADJUST',
  PROOF_DOWN = 'PROOF_DOWN',
  BOTTLE_PARTIAL = 'BOTTLE_PARTIAL',
  BOTTLE_EMPTY = 'BOTTLE_EMPTY',
  BOTTLING_GAIN = 'BOTTLING_GAIN',
  BOTTLING_LOSS = 'BOTTLING_LOSS',
  DELETE_PRODUCT = 'DELETE_PRODUCT',
  DELETE_PRODUCTION_BATCH = 'DELETE_PRODUCTION_BATCH',
  CHANGE_ACCOUNT = 'CHANGE_ACCOUNT'
}

// Base model types
export interface Product {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: User;
  containers?: Container[];
  productionBatches?: ProductionBatch[];
  transactions?: Transaction[];
}

export interface Container {
  id: string;
  userId: string;
  productId?: string;
  containerType: string; // 'barrel', 'drum', 'tank', 'tote', 'still', 'fermenter'
  volumeGallons: number;
  proof?: number;
  temperatureFahrenheit?: number;
  fillDate?: Date;
  isEmpty: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: User;
  product?: Product;
  transactions?: Transaction[];
}

export interface ProductionBatch {
  id: string;
  userId: string;
  productId?: string;
  batchType: string; // 'fermentation', 'distillation'
  batchNumber?: string;
  startDate?: Date;
  endDate?: Date;
  volumeGallons?: number;
  proof?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: User;
  product?: Product;
  transactions?: Transaction[];
}

export interface Transaction {
  id: string;
  userId: string;
  transactionType: string; // From TRANSACTION_TYPES constant
  containerId?: string;
  productionBatchId?: string;
  productId?: string;
  volumeGallons?: number;
  proof?: number;
  temperatureFahrenheit?: number;
  notes?: string;
  metadata?: any; // For additional transaction-specific data
  createdAt: Date;
  
  // Relations
  user?: User;
  container?: Container;
  productionBatch?: ProductionBatch;
  product?: Product;
}

// User interface (referenced but not defined in product.prisma)
export interface User {
  id: string;
  // Add other user fields as needed
}

// Input types for creating/updating models
export interface CreateProductInput {
  userId: string;
  name: string;
  description?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
}

export interface CreateContainerInput {
  userId: string;
  productId?: string;
  containerType: string;
  volumeGallons: number;
  proof?: number;
  temperatureFahrenheit?: number;
  fillDate?: Date;
  isEmpty?: boolean;
}

export interface UpdateContainerInput {
  productId?: string;
  containerType?: string;
  volumeGallons?: number;
  proof?: number;
  temperatureFahrenheit?: number;
  fillDate?: Date;
  isEmpty?: boolean;
}

export interface CreateProductionBatchInput {
  userId: string;
  productId?: string;
  batchType: string;
  batchNumber?: string;
  startDate?: Date;
  endDate?: Date;
  volumeGallons?: number;
  proof?: number;
  notes?: string;
}

export interface UpdateProductionBatchInput {
  productId?: string;
  batchType?: string;
  batchNumber?: string;
  startDate?: Date;
  endDate?: Date;
  volumeGallons?: number;
  proof?: number;
  notes?: string;
}

export interface CreateTransactionInput {
  userId: string;
  transactionType: string;
  containerId?: string;
  productionBatchId?: string;
  productId?: string;
  volumeGallons?: number;
  proof?: number;
  temperatureFahrenheit?: number;
  notes?: string;
  metadata?: any;
}

export interface UpdateTransactionInput {
  transactionType?: string;
  containerId?: string;
  productionBatchId?: string;
  productId?: string;
  volumeGallons?: number;
  proof?: number;
  temperatureFahrenheit?: number;
  notes?: string;
  metadata?: any;
}

// Query filter types
export interface ProductFilters {
  userId?: string;
  name?: string;
  description?: string;
}

export interface ContainerFilters {
  userId?: string;
  productId?: string;
  containerType?: string;
  isEmpty?: boolean;
}

export interface ProductionBatchFilters {
  userId?: string;
  productId?: string;
  batchType?: string;
  batchNumber?: string;
}

export interface TransactionFilters {
  userId?: string;
  transactionType?: string;
  containerId?: string;
  productionBatchId?: string;
  productId?: string;
}
