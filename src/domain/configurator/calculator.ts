import type { CalculationResult } from "@/src/types/configurator";

/** Glass weight per m² in kg for each thickness (mm) */
const GLASS_WEIGHT_FACTORS: Record<number, number> = {
  8: 20,
  10: 25,
  12: 30,
};

/**
 * Calculate door area in m².
 * All pure functions — no side effects.
 */
export function calculateDoorArea(widthMm: number, heightMm: number): number {
  return (widthMm / 1000) * (heightMm / 1000);
}

/**
 * Calculate estimated glass weight in kg.
 * Falls back to linear interpolation for thicknesses not in the lookup table.
 */
export function calculateGlassWeight(
  widthMm: number,
  heightMm: number,
  glassThicknessMm: number
): number {
  const area = calculateDoorArea(widthMm, heightMm);
  const factor = GLASS_WEIGHT_FACTORS[glassThicknessMm] ?? glassThicknessMm * 2.5;
  return Math.round(area * factor * 100) / 100;
}

/**
 * Combined calculation for area and weight.
 */
export function calculateAll(
  widthMm: number,
  heightMm: number,
  glassThicknessMm: number
): CalculationResult {
  const area = calculateDoorArea(widthMm, heightMm);
  const glassWeight = calculateGlassWeight(widthMm, heightMm, glassThicknessMm);
  return {
    area: Math.round(area * 100) / 100,
    glassWeight,
  };
}
