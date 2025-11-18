import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

// Custom CUID validation function
const isCUID = (value: string) => {
  if (!value) return true; // Allow empty values for optional fields
  // CUID format: 25 characters, starts with 'c', contains only lowercase letters and numbers
  const cuidRegex = /^c[a-z0-9]{24}$/;
  return cuidRegex.test(value);
};

// Product validation rules
export const validateProduct = [
  body('name').notEmpty().trim().withMessage('Product name is required'),
  body('description').optional().trim(),
  body('productCode').optional().trim(),
  body('category').optional().trim(),
  body('abv').optional().isNumeric().withMessage('ABV must be a number'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).withMessage('Status must be valid')
];

export const validateBulkProducts = [
  body('products').isArray().withMessage('Products must be an array'),
  body('products.*.name').notEmpty().withMessage('Each product must have a name')
];

// DSP validation rules
export const validateDSP = [
  body('name').notEmpty().trim().withMessage('DSP name is required'),
  body('description').optional().trim(),
];

// Container validation rules
export const validateContainer = [
  body('name').optional().trim(),
  body('type').notEmpty().withMessage('Container type is required'),
  body('productId').optional().custom(isCUID).withMessage('Product ID must be valid CUID'),
  body('status').optional().isIn(['EMPTY', 'FILLED', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'DAMAGED']).withMessage('Status must be valid'),
  body('account').optional().trim(),
  body('proof').optional().isNumeric().withMessage('Proof must be a number'),
  body('tareWeight').optional().isNumeric().withMessage('Tare weight must be a number'),
  body('netWeight').optional().isNumeric().withMessage('Net weight must be a number'),
  body('temperatureFahrenheit').optional().isNumeric().withMessage('Temperature must be a number'),
  body('fillDate').optional().isISO8601().withMessage('Fill date must be valid date'),
  body('location').optional().trim(),
  body('notes').optional().trim(),
  body('sameCount').optional().isNumeric().withMessage('Same count must be a number')
];

export const validateContainerUpdate = [
  body('name').optional().trim(),
  body('type').optional().notEmpty().withMessage('Container type cannot be empty'),
  body('productId').optional().custom(isCUID).withMessage('Product ID must be valid CUID'),
  body('status').optional().isIn(['EMPTY', 'FILLED', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'DAMAGED']).withMessage('Status must be valid'),
  body('account').optional().trim(),
  body('proof').optional().isNumeric().withMessage('Proof must be a number'),
  body('tareWeight').optional().isNumeric().withMessage('Tare weight must be a number'),
  body('netWeight').optional().isNumeric().withMessage('Net weight must be a number'),
  body('temperatureFahrenheit').optional().isNumeric().withMessage('Temperature must be a number'),
  body('fillDate').optional().isISO8601().withMessage('Fill date must be valid date'),
  body('sameCount').optional().isNumeric().withMessage('Same count must be a number'),
  // body('location').optional().trim(),
  // body('notes').optional().trim()
];

export const validateBulkContainers = [
  body('containers').isArray().withMessage('Containers must be an array'),
  body('containers.*.type').notEmpty().withMessage('Each container must have a type')
];

// Fermentation batch validation rules
export const validateFermentationBatch = [
  body('batchName').notEmpty().trim().withMessage('Batch name is required'),
  // body('fermenterId').optional().custom(isCUID).withMessage('Fermentation ID must be valid CUID'),
  body('startDate').optional().isISO8601().withMessage('Start date must be valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be valid date'),
  body('volumeGallons').optional().isNumeric().withMessage('Volume must be a number'),
  body('startSG').optional().isNumeric().withMessage('Original gravity must be a number'),
  body('finalFG').optional().isNumeric().withMessage('Final gravity must be a number'),
  body('ingredient').optional().trim(),
  body('notes').optional().trim(),
  // body('status').optional().isIn(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).withMessage('Status must be valid')
];

export const validateFermentationBatchUpdate = [
  body('batchName').optional().trim(),
  // body('fermenterId').optional().custom(isCUID).withMessage('Fermentation ID must be valid CUID'),
  body('startDate').optional().isISO8601().withMessage('Start date must be valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be valid date'),
  body('volumeGallons').optional().isNumeric().withMessage('Volume must be a number'),
  body('startSG').optional().isNumeric().withMessage('Original gravity must be a number'),
  body('finalFG').optional().isNumeric().withMessage('Final gravity must be a number'),
  body('ingredient').optional().trim(),
  body('notes').optional().trim(),
  // body('status').optional().isIn(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).withMessage('Status must be valid')
];

export const validateDistillationBatch = [
  body('batchName').notEmpty().trim().withMessage('Batch number is required'),
  body('startDate').optional().isISO8601().withMessage('Start date must be valid date'),
  body('fermentationId').optional().custom(isCUID).withMessage('Fermentation ID must be valid CUID'),
  body('chargeVolumeGallons').optional().isNumeric().withMessage('Volume must be a number'),
  body('yieldVolumeGallons').optional().isNumeric().withMessage('Charge Yield Volume must be a number'),
  body('chargeProof').optional().isNumeric().withMessage('Charge Proof must be a number'),
  body('yieldProof').optional().isNumeric().withMessage('Yield Proof must be a number'),
  body('chargeTemperature').optional().isNumeric().withMessage('Charge Temperature must be a number'),
  body('yieldTemperature').optional().isNumeric().withMessage('Yield Temperature must be a number'),
  body('productId').optional().custom(isCUID).withMessage('Product ID must be valid CUID'),
  body('storeYieldContainer').optional().custom(isCUID).withMessage('Store Yield Container ID must be valid CUID'),
  body('notes').optional().trim(),
  // body('status').optional().isIn(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).withMessage('Status must be valid')
];
export const validateDistillationBatchUpdate = [
  body('batchName').notEmpty().trim().withMessage('Batch number is required'),
  body('startDate').optional().isISO8601().withMessage('Start date must be valid date'),
  body('fermentationId').optional().custom(isCUID).withMessage('Fermentation ID must be valid CUID'),
  body('chargeVolumeGallons').optional().isNumeric().withMessage('Charge Volume must be a number'),
  body('yieldVolumeGallons').optional().isNumeric().withMessage('Yield Volume must be a number'),
  body('chargeProof').optional().isNumeric().withMessage('Charge Proof must be a number'),
  body('yieldProof').optional().isNumeric().withMessage('Yield Proof must be a number'),
  body('chargeTemperature').optional().isNumeric().withMessage('Charge Temperature must be a number'),
  body('yieldTemperature').optional().isNumeric().withMessage('Yield Temperature must be a number'),
  body('productId').optional().custom(isCUID).withMessage('Product ID must be valid CUID'),
  body('storeYieldContainer').optional().custom(isCUID).withMessage('Store Yield Container ID must be valid CUID'),
  body('notes').optional().trim(),
];


// Transaction validation rules
export const validateTransaction = [
  body('transactionType').notEmpty().withMessage('Transaction type is required'),
  body('containerId').optional().custom(isCUID).withMessage('Container ID must be valid CUID'),
  body('productionBatchId').optional().custom(isCUID).withMessage('Production batch ID must be valid CUID'),
  body('productId').optional().custom(isCUID).withMessage('Product ID must be valid CUID'),
  body('volumeGallons').optional().isNumeric().withMessage('Volume must be a number'),
  body('proof').optional().isNumeric().withMessage('Proof must be a number'),
  body('temperatureFahrenheit').optional().isNumeric().withMessage('Temperature must be a number'),
  body('notes').optional().trim(),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
];

// Auth validation rules
export const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Container operation validation rules
export const validateContainerTransfer = [
  body('sourceContainerId').custom(isCUID).withMessage('Source container ID must be valid CUID'),
  body('destinationContainerId').custom(isCUID).withMessage('Destination container ID must be valid CUID'),
  body('amount').isNumeric().withMessage('Transfer amount must be a number'),
  body('transAmountWG').isNumeric().withMessage('Transfer amount in weight must be a number'),
  body('transferAll').isBoolean().withMessage('Transfer all must be a boolean'),
  body('proof').isNumeric().withMessage('Proof must be a number'),
  // body('transferUnit').optional().isIn(['gallons', 'weight', 'proofGallons']).withMessage('Unit must be valid')
];

export const validateProofDown = [
  body('containerId').custom(isCUID).withMessage('Container ID must be valid CUID'),
  body('targetProof').isNumeric().withMessage('Target proof must be a number'),
  body('finalWineGallons').isNumeric().withMessage('Final wine gallons must be a number')
];

export const validateAdjustment = [
  body('containerId').custom(isCUID).withMessage('Container ID must be valid CUID'),
  body('method').isIn(['add', 'remove']).withMessage('Adjustment type must be valid'),
  body('amount').isNumeric().withMessage('Adjustment amount must be a number'),
  body('wineGallons').isNumeric().withMessage('Wine gallons must be a number'),
  // body('notes').optional().trim()
];

export const validateBottling = [
  body('containerId').custom(isCUID).withMessage('Container ID must be valid CUID'),
  body('remainderLbs').isNumeric().withMessage('Remainder Lbs must be a number'),
  body('bottleSize').isIn(['375', '750', '1000', '1750, 50']).withMessage('Bottle size must be valid'),
  body('numberOfBottles').isInt().withMessage('Number of bottles must be an integer'),
  body('remainderAction').isIn(['keep', 'empty', 'loss', 'gain']).withMessage('Remainder action must be valid'),
  body('bottledWG').isNumeric().withMessage('Bottled WG must be a number')
];

export const validateAccountChange = [
  body('containerId').custom(isCUID).withMessage('Container ID must be valid CUID'),
  body('newAccount').isIn(['storage', 'production', 'bottling', 'sampling']).withMessage('Account must be valid')
];

// Barrel validation rules
export const validateBarrel = [
  body('barrelNumber').notEmpty().withMessage('Barrel number is required'),
  body('barrelType').notEmpty().withMessage('Barrel type is required'),
  body('capacityGallons').isNumeric().withMessage('Capacity must be a number'),
  body('charLevel').optional().isInt({ min: 1, max: 4 }).withMessage('Char level must be between 1-4'),
  body('toastLevel').optional().isInt({ min: 1, max: 4 }).withMessage('Toast level must be between 1-4'),
  body('currentVolumeGallons').optional().isNumeric().withMessage('Current volume must be a number'),
  body('proof').optional().isNumeric().withMessage('Proof must be a number'),
  body('fillDate').optional().isISO8601().withMessage('Fill date must be valid date'),
  body('location').optional().trim(),
  body('status').optional().isIn(['EMPTY', 'FILLED', 'DUMPED', 'TRANSFERRED', 'DAMAGED']).withMessage('Status must be valid'),
  body('notes').optional().trim()
];

export const validateBarrelUpdate = [
  body('barrelNumber').optional().notEmpty().withMessage('Barrel number cannot be empty'),
  body('barrelType').optional().notEmpty().withMessage('Barrel type cannot be empty'),
  body('capacityGallons').optional().isNumeric().withMessage('Capacity must be a number'),
  body('charLevel').optional().isInt({ min: 1, max: 4 }).withMessage('Char level must be between 1-4'),
  body('toastLevel').optional().isInt({ min: 1, max: 4 }).withMessage('Toast level must be between 1-4'),
  body('currentVolumeGallons').optional().isNumeric().withMessage('Current volume must be a number'),
  body('proof').optional().isNumeric().withMessage('Proof must be a number'),
  body('fillDate').optional().isISO8601().withMessage('Fill date must be valid date'),
  body('dumpDate').optional().isISO8601().withMessage('Dump date must be valid date'),
  body('ageYears').optional().isNumeric().withMessage('Age must be a number'),
  body('location').optional().trim(),
  body('status').optional().isIn(['EMPTY', 'FILLED', 'DUMPED', 'TRANSFERRED', 'DAMAGED']).withMessage('Status must be valid'),
  body('notes').optional().trim()
];

// Batching validation rules
export const validateBatchingRun = [
  body('batchNumber').notEmpty().withMessage('Batch number is required'),
  body('batchType').isIn(['BLENDING', 'FILTERING', 'CHILL_FILTERING', 'CARBON_FILTERING', 'FINISHING']).withMessage('Batch type must be valid'),
  body('startDate').isISO8601().withMessage('Start date must be valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be valid date'),
  body('volumeGallons').optional().isNumeric().withMessage('Volume must be a number'),
  body('proof').optional().isNumeric().withMessage('Proof must be a number'),
  body('temperatureFahrenheit').optional().isNumeric().withMessage('Temperature must be a number'),
  body('status').optional().isIn(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).withMessage('Status must be valid'),
  body('notes').optional().trim()
];

export const validateBatchingRunUpdate = [
  body('batchNumber').optional().notEmpty().withMessage('Batch number cannot be empty'),
  body('batchType').optional().isIn(['BLENDING', 'FILTERING', 'CHILL_FILTERING', 'CARBON_FILTERING', 'FINISHING']).withMessage('Batch type must be valid'),
  body('startDate').optional().isISO8601().withMessage('Start date must be valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be valid date'),
  body('volumeGallons').optional().isNumeric().withMessage('Volume must be a number'),
  body('proof').optional().isNumeric().withMessage('Proof must be a number'),
  body('temperatureFahrenheit').optional().isNumeric().withMessage('Temperature must be a number'),
  body('status').optional().isIn(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).withMessage('Status must be valid'),
  body('notes').optional().trim()
];

export const validateBottlingRun = [
  body('batchNumber').notEmpty().withMessage('Batch number is required'),
  body('bottleSize').isNumeric().withMessage('Bottle size must be a number'),
  body('bottlesProduced').isInt().withMessage('Bottles produced must be an integer'),
  body('volumeGallons').isNumeric().withMessage('Volume must be a number'),
  body('proof').isNumeric().withMessage('Proof must be a number'),
  body('startDate').isISO8601().withMessage('Start date must be valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be valid date'),
  body('status').optional().isIn(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).withMessage('Status must be valid'),
  body('notes').optional().trim()
];

export const validateBottlingRunUpdate = [
  body('batchNumber').optional().notEmpty().withMessage('Batch number cannot be empty'),
  body('bottleSize').optional().isNumeric().withMessage('Bottle size must be a number'),
  body('bottlesProduced').optional().isInt().withMessage('Bottles produced must be an integer'),
  body('volumeGallons').optional().isNumeric().withMessage('Volume must be a number'),
  body('proof').optional().isNumeric().withMessage('Proof must be a number'),
  body('startDate').optional().isISO8601().withMessage('Start date must be valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be valid date'),
  body('status').optional().isIn(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).withMessage('Status must be valid'),
  body('notes').optional().trim()
];

// Transfer validation rules
export const validateTransfer = [
  body('transferNumber').notEmpty().withMessage('Transfer number is required'),
  body('transferType').isIn(['BARREL', 'CONTAINER', 'TOTE', 'TANKER']).withMessage('Transfer type must be valid'),
  body('direction').isIn(['INBOUND', 'OUTBOUND']).withMessage('Direction must be valid'),
  body('volumeGallons').isNumeric().withMessage('Volume must be a number'),
  body('proof').isNumeric().withMessage('Proof must be a number'),
  body('transferDate').isISO8601().withMessage('Transfer date must be valid date'),
  body('temperatureFahrenheit').optional().isNumeric().withMessage('Temperature must be a number'),
  body('destination').optional().trim(),
  body('carrier').optional().trim(),
  body('sealNumber').optional().trim(),
  body('status').optional().isIn(['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']).withMessage('Status must be valid'),
  body('notes').optional().trim()
];

export const validateTransferUpdate = [
  body('transferNumber').optional().notEmpty().withMessage('Transfer number cannot be empty'),
  body('transferType').optional().isIn(['BARREL', 'CONTAINER', 'TOTE', 'TANKER']).withMessage('Transfer type must be valid'),
  body('direction').optional().isIn(['INBOUND', 'OUTBOUND']).withMessage('Direction must be valid'),
  body('volumeGallons').optional().isNumeric().withMessage('Volume must be a number'),
  body('proof').optional().isNumeric().withMessage('Proof must be a number'),
  body('transferDate').optional().isISO8601().withMessage('Transfer date must be valid date'),
  body('temperatureFahrenheit').optional().isNumeric().withMessage('Temperature must be a number'),
  body('destination').optional().trim(),
  body('carrier').optional().trim(),
  body('sealNumber').optional().trim(),
  body('status').optional().isIn(['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']).withMessage('Status must be valid'),
  body('notes').optional().trim()
];

// Finished Goods validation rules
export const validateFinishedGoods = [
  body('bottleSize').isNumeric().withMessage('Bottle size must be a number'),
  body('quantity').isInt().withMessage('Quantity must be an integer'),
  body('proof').isNumeric().withMessage('Proof must be a number'),
  body('batchNumber').optional().trim(),
  body('location').optional().trim(),
  body('status').optional().isIn(['IN_WAREHOUSE', 'SHIPPED', 'RETURNED', 'DAMAGED']).withMessage('Status must be valid'),
  body('receivedDate').optional().isISO8601().withMessage('Received date must be valid date'),
  body('shippedDate').optional().isISO8601().withMessage('Shipped date must be valid date'),
  body('notes').optional().trim()
];

export const validateFinishedGoodsUpdate = [
  body('bottleSize').optional().isNumeric().withMessage('Bottle size must be a number'),
  body('quantity').optional().isInt().withMessage('Quantity must be an integer'),
  body('proof').optional().isNumeric().withMessage('Proof must be a number'),
  body('batchNumber').optional().trim(),
  body('location').optional().trim(),
  body('status').optional().isIn(['IN_WAREHOUSE', 'SHIPPED', 'RETURNED', 'DAMAGED']).withMessage('Status must be valid'),
  body('receivedDate').optional().isISO8601().withMessage('Received date must be valid date'),
  body('shippedDate').optional().isISO8601().withMessage('Shipped date must be valid date'),
  body('notes').optional().trim()
];

export const validateBailmentDepletion = [
  body('depletionType').isIn(['SALE', 'SAMPLE', 'DAMAGE', 'THEFT', 'RETURN', 'ADJUSTMENT']).withMessage('Depletion type must be valid'),
  body('quantity').isInt().withMessage('Quantity must be an integer'),
  body('depletionDate').isISO8601().withMessage('Depletion date must be valid date'),
  body('reason').optional().trim(),
  body('notes').optional().trim()
];

export const validateBailmentDepletionUpdate = [
  body('depletionType').optional().isIn(['SALE', 'SAMPLE', 'DAMAGE', 'THEFT', 'RETURN', 'ADJUSTMENT']).withMessage('Depletion type must be valid'),
  body('quantity').optional().isInt().withMessage('Quantity must be an integer'),
  body('depletionDate').optional().isISO8601().withMessage('Depletion date must be valid date'),
  body('reason').optional().trim(),
  body('notes').optional().trim()
];

// Tank validation rules
export const validateTank = [
  body('tankNumber').notEmpty().withMessage('Tank number is required'),
  body('tankType').isIn(['STORAGE', 'BLENDING', 'FINISHING', 'FILTERING', 'TEMPORARY']).withMessage('Tank type must be valid'),
  body('capacityGallons').isNumeric().withMessage('Capacity must be a number'),
  body('currentVolumeGallons').optional().isNumeric().withMessage('Current volume must be a number'),
  body('proof').optional().isNumeric().withMessage('Proof must be a number'),
  body('temperatureFahrenheit').optional().isNumeric().withMessage('Temperature must be a number'),
  body('status').optional().isIn(['EMPTY', 'FILLED', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE']).withMessage('Status must be valid'),
  body('location').optional().trim(),
  body('notes').optional().trim()
];

export const validateTankUpdate = [
  body('tankNumber').optional().notEmpty().withMessage('Tank number cannot be empty'),
  body('tankType').optional().isIn(['STORAGE', 'BLENDING', 'FINISHING', 'FILTERING', 'TEMPORARY']).withMessage('Tank type must be valid'),
  body('capacityGallons').optional().isNumeric().withMessage('Capacity must be a number'),
  body('currentVolumeGallons').optional().isNumeric().withMessage('Current volume must be a number'),
  body('proof').optional().isNumeric().withMessage('Proof must be a number'),
  body('temperatureFahrenheit').optional().isNumeric().withMessage('Temperature must be a number'),
  body('status').optional().isIn(['EMPTY', 'FILLED', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE']).withMessage('Status must be valid'),
  body('location').optional().trim(),
  body('notes').optional().trim()
];

// TTB Report validation rules
export const validateTTBReport = [
  body('reportType').isIn(['MONTHLY_PRODUCTION', 'MONTHLY_INVENTORY', 'ANNUAL_PRODUCTION', 'SPECIAL_REPORT']).withMessage('Report type must be valid'),
  body('reportPeriod').notEmpty().withMessage('Report period is required'),
  body('reportDate').isISO8601().withMessage('Report date must be valid date'),
  body('status').optional().isIn(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'AMENDED']).withMessage('Status must be valid'),
  body('submittedDate').optional().isISO8601().withMessage('Submitted date must be valid date'),
  body('ttbApprovalDate').optional().isISO8601().withMessage('TTB approval date must be valid date'),
  body('notes').optional().trim()
];

export const validateTTBReportUpdate = [
  body('reportType').optional().isIn(['MONTHLY_PRODUCTION', 'MONTHLY_INVENTORY', 'ANNUAL_PRODUCTION', 'SPECIAL_REPORT']).withMessage('Report type must be valid'),
  body('reportPeriod').optional().notEmpty().withMessage('Report period cannot be empty'),
  body('reportDate').optional().isISO8601().withMessage('Report date must be valid date'),
  body('status').optional().isIn(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'AMENDED']).withMessage('Status must be valid'),
  body('submittedDate').optional().isISO8601().withMessage('Submitted date must be valid date'),
  body('ttbApprovalDate').optional().isISO8601().withMessage('TTB approval date must be valid date'),
  body('notes').optional().trim()
];

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("ERRORS:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
