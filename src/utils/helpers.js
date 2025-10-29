export const DENSITY_ETHANOL_LBS_PER_GALLON = 6.58; // Updated to correct value at 20°C
export const DENSITY_WATER_LBS_PER_GALLON = 8.328;
export const TTB_TEMPERATURE_CORRECTIONS = {
  // Temperature (°F) -> { observed_proof -> correction_factor }
  60: { 80: 0.2, 85: 0.3, 90: 0.4, 95: 0.5, 100: 0.6, 105: 0.7, 110: 0.8, 115: 0.9, 120: 1.0, 125: 1.1, 130: 1.2, 135: 1.3, 140: 1.4, 145: 1.5, 150: 1.6, 155: 1.7, 160: 1.8, 165: 1.9, 170: 2.0 },
  62: { 80: 0.1, 85: 0.2, 90: 0.3, 95: 0.4, 100: 0.5, 105: 0.6, 110: 0.7, 115: 0.8, 120: 0.9, 125: 1.0, 130: 1.1, 135: 1.2, 140: 1.3, 145: 1.4, 150: 1.5, 155: 1.6, 160: 1.7, 165: 1.8, 170: 1.9 },
  64: { 80: 0.0, 85: 0.1, 90: 0.2, 95: 0.3, 100: 0.4, 105: 0.5, 110: 0.6, 115: 0.7, 120: 0.8, 125: 0.9, 130: 1.0, 135: 1.1, 140: 1.2, 145: 1.3, 150: 1.4, 155: 1.5, 160: 1.6, 165: 1.7, 170: 1.8 },
  66: { 80: -0.1, 85: 0.0, 90: 0.1, 95: 0.2, 100: 0.3, 105: 0.4, 110: 0.5, 115: 0.6, 120: 0.7, 125: 0.8, 130: 0.9, 135: 1.0, 140: 1.1, 145: 1.2, 150: 1.3, 155: 1.4, 160: 1.5, 165: 1.6, 170: 1.7 },
  68: { 80: -0.2, 85: -0.1, 90: 0.0, 95: 0.1, 100: 0.2, 105: 0.3, 110: 0.4, 115: 0.5, 120: 0.6, 125: 0.7, 130: 0.8, 135: 0.9, 140: 1.0, 145: 1.1, 150: 1.2, 155: 1.3, 160: 1.4, 165: 1.5, 170: 1.6 },
  70: { 80: -0.3, 85: -0.2, 90: -0.1, 95: 0.0, 100: 0.1, 105: 0.2, 110: 0.3, 115: 0.4, 120: 0.5, 125: 0.6, 130: 0.7, 135: 0.8, 140: 0.9, 145: 1.0, 150: 1.1, 155: 1.2, 160: 1.3, 165: 1.4, 170: 1.5 },
  72: { 80: -0.4, 85: -0.3, 90: -0.2, 95: -0.1, 100: 0.0, 105: 0.1, 110: 0.2, 115: 0.3, 120: 0.4, 125: 0.5, 130: 0.6, 135: 0.7, 140: 0.8, 145: 0.9, 150: 1.0, 155: 1.1, 160: 1.2, 165: 1.3, 170: 1.4 },
  74: { 80: -0.5, 85: -0.4, 90: -0.3, 95: -0.2, 100: -0.1, 105: 0.0, 110: 0.1, 115: 0.2, 120: 0.3, 125: 0.4, 130: 0.5, 135: 0.6, 140: 0.7, 145: 0.8, 150: 0.9, 155: 1.0, 160: 1.1, 165: 1.2, 170: 1.3 },
  76: { 80: -0.6, 85: -0.5, 90: -0.4, 95: -0.3, 100: -0.2, 105: -0.1, 110: 0.0, 115: 0.1, 120: 0.2, 125: 0.3, 130: 0.4, 135: 0.5, 140: 0.6, 145: 0.7, 150: 0.8, 155: 0.9, 160: 1.0, 165: 1.1, 170: 1.2 },
  78: { 80: -0.7, 85: -0.6, 90: -0.5, 95: -0.4, 100: -0.3, 105: -0.2, 110: -0.1, 115: 0.0, 120: 0.1, 125: 0.2, 130: 0.3, 135: 0.4, 140: 0.5, 145: 0.6, 150: 0.7, 155: 0.8, 160: 0.9, 165: 1.0, 170: 1.1 },
  80: { 80: -0.8, 85: -0.7, 90: -0.6, 95: -0.5, 100: -0.4, 105: -0.3, 110: -0.2, 115: -0.1, 120: 0.0, 125: 0.1, 130: 0.2, 135: 0.3, 140: 0.4, 145: 0.5, 150: 0.6, 155: 0.7, 160: 0.8, 165: 0.9, 170: 1.0 }
};

// --- Helper Functions ---

// Get TTB temperature correction factor
export const getTTBTemperatureCorrection = (temperature, observedProof) => {
  // Round temperature to nearest even number (TTB table uses even temperatures)
  const roundedTemp = Math.round(temperature / 2) * 2;
  const roundedProof = Math.round(observedProof / 5) * 5; // Round to nearest 5
  
  // Get the correction table for this temperature
  const tempTable = TTB_TEMPERATURE_CORRECTIONS[roundedTemp];
  if (!tempTable) return 0; // No correction if temperature out of range
  
  // Get the correction factor for this proof
  const correction = tempTable[roundedProof];
  return correction || 0;
};

// Calculate true proof using TTB method
export const calculateTrueProof = (observedProof, temperature) => {
  const correction = getTTBTemperatureCorrection(temperature, observedProof);
  return observedProof + correction;
};

// Calculate proof gallons using TTB method
export const calculateProofGallonsTTB = (wineGallons, observedProof, temperature) => {
  const trueProof = calculateTrueProof(observedProof, temperature);
  return wineGallons * (trueProof / 100);
};

// TTB-compliant density calculation at 60°F
// Since Snap 51 provides temperature-corrected proof readings, we use the proof directly
export const calculateSpiritDensity = (proof) => {
  if (isNaN(proof) || proof < 0) proof = 0;
  if (proof === 0) return DENSITY_WATER_LBS_PER_GALLON;
  
  // TTB Table 5 density values for different proof levels at 60°F
  // These values are based on TTB Table 5 (Pounds per wine gallon)
  const densityTable = {
    0: 8.32198,   // Water (approximate)
    1: 8.32198,
    2: 8.31574,
    3: 8.30957,
    4: 8.30350,
    5: 8.29742,
    6: 8.29150,
    7: 8.28551,
    8: 8.27976,
    9: 8.27401,
    10: 8.26835,
    11: 8.26277,
    12: 8.25736,
    13: 8.25194,
    14: 8.24670,
    15: 8.24153,
    16: 8.23645,
    17: 8.23137,
    18: 8.22646,
    19: 8.22155,
    20: 8.21663,
    21: 8.21172,
    22: 8.20689,
    23: 8.20206,
    24: 8.19731,
    25: 8.19265,
    26: 8.18807,
    27: 8.18349,
    28: 8.17899,
    29: 8.17457,
    30: 8.17016,
    31: 8.16575,
    32: 8.16133,
    33: 8.15700,
    34: 8.15275,
    35: 8.14851,
    36: 8.14434,
    37: 8.14018,
    38: 8.13601,
    39: 8.13193,
    40: 8.12785,
    41: 8.12369,
    42: 8.11936,
    43: 8.11519,
    44: 8.11095,
    45: 8.10670,
    46: 8.10245,
    47: 8.09812,
    48: 8.09379,
    49: 8.08946,
    50: 8.08505,
    51: 8.08063,
    52: 8.07622,
    53: 8.07172,
    54: 8.06722,
    55: 8.06264,
    56: 8.05806,
    57: 8.05340,
    58: 8.04873,
    59: 8.04399,
    60: 8.03924,
    61: 8.03433,
    62: 8.02950,
    63: 8.02450,
    64: 8.01934,
    65: 8.01417,
    66: 8.00884,
    67: 8.00351,
    68: 7.99810,
    69: 7.99260,
    70: 7.98702,
    71: 7.98136,
    72: 7.97553,
    73: 7.96970,
    74: 7.96370,
    75: 7.95771,
    76: 7.95146,
    77: 7.94530,
    78: 7.93897,
    79: 7.93264,
    80: 7.92614,
    81: 7.91965,
    82: 7.91298,
    83: 7.90632,
    84: 7.89949,
    85: 7.89266,
    86: 7.88575,
    87: 7.87876,
    88: 7.87168,
    89: 7.86443,
    90: 7.85719,
    91: 7.84986,
    92: 7.84244,
    93: 7.83495,
    94: 7.82737,
    95: 7.81971,
    96: 7.81196,
    97: 7.80413,
    98: 7.79622,
    99: 7.78823,
    100: 7.78007,
    // TTB Table 5 values for proofs 101-200
    101: 7.77190,
    102: 7.76355,
    103: 7.75502,
    104: 7.74631,
    105: 7.73742,
    106: 7.72835,
    107: 7.71910,
    108: 7.70967,
    109: 7.70006,
    110: 7.69603,
    111: 7.68627,
    112: 7.67633,
    113: 7.66621,
    114: 7.65591,
    115: 7.64543,
    116: 7.63477,
    117: 7.62393,
    118: 7.61291,
    119: 7.60171,
    120: 7.60642,
    121: 7.59033,
    122: 7.57806,
    123: 7.56561,
    124: 7.55298,
    125: 7.54017,
    126: 7.52718,
    127: 7.51401,
    128: 7.50066,
    129: 7.48713,
    130: 7.51123,
    131: 7.45972,
    132: 7.44593,
    133: 7.43196,
    134: 7.41781,
    135: 7.40348,
    136: 7.38897,
    137: 7.37428,
    138: 7.35941,
    139: 7.34436,
    140: 7.41096,
    141: 7.31413,
    142: 7.29882,
    143: 7.28333,
    144: 7.26766,
    145: 7.25181,
    146: 7.23578,
    147: 7.21957,
    148: 7.20318,
    149: 7.18661,
    150: 7.30502,
    151: 7.29411,
    152: 7.15376,
    153: 7.13623,
    154: 7.11852,
    155: 7.10063,
    156: 7.08256,
    157: 7.06431,
    158: 7.04588,
    159: 7.02727,
    160: 7.19259,
    161: 6.98948,
    162: 6.97019,
    163: 6.95072,
    164: 6.93107,
    165: 6.91124,
    166: 6.89123,
    167: 6.87104,
    168: 6.85067,
    169: 6.83012,
    170: 7.07292,
    171: 6.78839,
    172: 6.76716,
    173: 6.74575,
    174: 6.72416,
    175: 6.70239,
    176: 6.68044,
    177: 6.65831,
    178: 6.63600,
    179: 6.61351,
    180: 6.94258,
    181: 6.56884,
    182: 6.54567,
    183: 6.52232,
    184: 6.49879,
    185: 6.47508,
    186: 6.45119,
    187: 6.42712,
    188: 6.40287,
    189: 6.37844,
    190: 6.79434,
    191: 6.32883,
    192: 6.30372,
    193: 6.27843,
    194: 6.25296,
    195: 6.22731,
    196: 6.20148,
    197: 6.17547,
    198: 6.14928,
    199: 6.12291,
    200: 6.60970
  };
  
  // For exact proof values, return the table value
  if (densityTable[proof] !== undefined) {
    return densityTable[proof];
  }
  
  // For values between table entries, interpolate
  const lowerProof = Math.floor(proof);
  const upperProof = Math.ceil(proof);
  
  if (densityTable[lowerProof] !== undefined && densityTable[upperProof] !== undefined) {
    const weight = proof - lowerProof;
    return densityTable[lowerProof] + (densityTable[upperProof] - densityTable[lowerProof]) * weight;
  }
  
  // Fallback to linear calculation for extreme values
  const volEthanolFraction = proof / 200;
  const volWaterFraction = 1 - volEthanolFraction;
  return (volEthanolFraction * DENSITY_ETHANOL_LBS_PER_GALLON) + (volWaterFraction * DENSITY_WATER_LBS_PER_GALLON);
};

// Calculate derived values from weight - using temperature-corrected proof from Snap 51
export const calculateDerivedValuesFromWeight = (tareWeight, grossWeight, observedProof) => {
  const tare = parseFloat(tareWeight) || 0;
  const gross = parseFloat(grossWeight) || 0;
  const prf = parseFloat(observedProof) || 0;
  let netWeightLbs = 0;
  if (gross > tare) { netWeightLbs = gross - tare; } else { netWeightLbs = 0; }
  
  // Since Snap 51 provides temperature-corrected proof, use it directly for density calculation
  const spiritDensity = calculateSpiritDensity(prf); // Always use 60°F for TTB standard
  let wineGallons = 0;
  if (netWeightLbs > 0 && spiritDensity > 0) { wineGallons = netWeightLbs / spiritDensity; }
  // For proof gallons, use the temperature-corrected proof directly (no additional correction needed)
  const proofGallons = wineGallons * (prf / 100);
  
  return {
      netWeightLbs: parseFloat(netWeightLbs.toFixed(2)),
      wineGallons: parseFloat(wineGallons.toFixed(2)),
      proofGallons: parseFloat(proofGallons.toFixed(2)),
      spiritDensity: parseFloat(spiritDensity.toFixed(2)),
      grossWeightLbs: parseFloat(gross.toFixed(2))
  };
};

export const calculateDerivedValuesFromWineGallons = (wineGallons, observedProof, tareWeight, temperature = 60) => {
  const wg = parseFloat(wineGallons) || 0;
  const prf = parseFloat(observedProof) || 0;
  const tare = parseFloat(tareWeight) || 0;
  const spiritDensity = calculateSpiritDensity(prf);
  const netWeightLbs = wg * spiritDensity;
  const grossWeightLbs = netWeightLbs + tare;
  
  // Calculate proof gallons using TTB method
  const proofGallons = calculateProofGallonsTTB(wg, prf, temperature);
  
  return {
      netWeightLbs: parseFloat(netWeightLbs.toFixed(2)),
      wineGallons: parseFloat(wg.toFixed(2)),
      proofGallons: parseFloat(proofGallons.toFixed(2)),
      spiritDensity: parseFloat(spiritDensity.toFixed(2)),
      grossWeightLbs: parseFloat(grossWeightLbs.toFixed(2))
  };
};

export const calculateDerivedValuesFromProofGallons = (proofGallons, observedProof, tareWeight, temperature = 60) => {
  const pg = parseFloat(proofGallons) || 0;
  const prf = parseFloat(observedProof) || 0;
  const tare = parseFloat(tareWeight) || 0;
  
  // For proof gallons input, we need to work backwards to find wine gallons
  let wineGallons = 0;
  if (prf > 0 && pg > 0) {
      // Use the true proof to calculate wine gallons
      const trueProof = calculateTrueProof(prf, temperature);
      wineGallons = pg / (trueProof / 100);
  } else if (pg === 0) {
      wineGallons = 0;
  } else if (prf === 0) {
      // If proof is 0, we can't calculate wine gallons from proof gallons
      wineGallons = 0;
  }
  
  const spiritDensity = calculateSpiritDensity(prf);
  const netWeightLbs = wineGallons * spiritDensity;
  const grossWeightLbs = netWeightLbs + tare;
  
  return {
      netWeightLbs: parseFloat(netWeightLbs.toFixed(2)),
      wineGallons: parseFloat(wineGallons.toFixed(2)),
      proofGallons: parseFloat(pg.toFixed(2)),
      spiritDensity: parseFloat(spiritDensity.toFixed(2)),
      grossWeightLbs: parseFloat(grossWeightLbs.toFixed(2))
  };
};

//**GOM **//
export const calcGallonsFromWeight = (proof, netWeightLbs) =>
{
  const spiritDensity = calculateSpiritDensity(proof);
  const wineGallons = netWeightLbs / spiritDensity;
  const proofGallons = wineGallons * proof / 100;

  return {
    wineGallons,
    proofGallons
  };
};

export const calcWeightFromWineGallons = (proof, wineGallons) =>
{
  const spiritDensity = calculateSpiritDensity(proof);
  const netWeightLbs = wineGallons * spiritDensity;

  return parseFloat(netWeightLbs.toFixed(3));
};

export const calcWeightFromProofGallons = (proof, proofGallons) =>
{
  const spiritDensity = calculateSpiritDensity(proof);
  const wineGallons = proofGallons / (proof / 100);
  const netWeightLbs = wineGallons * spiritDensity;

  return parseFloat(netWeightLbs.toFixed(3));
};

export const calculateBottledVolume = (bottleSize, count = 1) => {
  // Convert to wine gallons (1 liter = 0.264172 gallons)
  return (bottleSize * count * 0.264172);
};