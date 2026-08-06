import type { SkuCompatibility, ProductSku } from "@/src/types/configurator";

export interface CompatibilityResult {
  warnings: string[];
  compatible: boolean;
}

/**
 * Check recommended SKUs for compatibility issues.
 *
 * Rules:
 * - "incompatible" relation → warning, items should not be recommended together
 * - "alternative" relation → informational note, user may want to choose
 * - "compatible" relation → confirmation, used for "why recommended"
 */
export function checkCompatibility(
  skus: string[],
  compatibilityData: SkuCompatibility[],
  _skuDetails: ProductSku[]
): CompatibilityResult {
  const warnings: string[] = [];
  const skuSet = new Set(skus);

  for (const comp of compatibilityData) {
    // Only check pairs where both SKUs are in our recommendation
    if (!skuSet.has(comp.sku) || !skuSet.has(comp.compatibleSku)) {
      continue;
    }

    if (comp.relation === "incompatible") {
      warnings.push(
        `Incompatible pairing: ${comp.sku} and ${comp.compatibleSku}. ${comp.note ?? ""}`.trim()
      );
    }

    if (comp.relation === "alternative") {
      warnings.push(
        `Note: ${comp.sku} and ${comp.compatibleSku} are alternatives. ${comp.note ?? ""}`.trim()
      );
    }
  }

  return {
    warnings,
    compatible: warnings.filter((w) => w.startsWith("Incompatible")).length === 0,
  };
}

/**
 * Build "why recommended" reasons for a given SKU based on config parameters.
 */
export function buildWhyRecommended(
  sku: ProductSku,
  glassThicknessMm: number,
  doorWeight: number,
  widthMm: number,
  heightMm: number,
  finish: string
): string[] {
  const reasons: string[] = [];

  // Glass thickness compatibility
  if (
    sku.minGlassThickness != null &&
    sku.maxGlassThickness != null &&
    glassThicknessMm >= sku.minGlassThickness &&
    glassThicknessMm <= sku.maxGlassThickness
  ) {
    reasons.push(
      `✓ Glass thickness compatible (${sku.minGlassThickness}-${sku.maxGlassThickness}mm)`
    );
  }

  // Door weight compatibility
  if (sku.maxDoorWeight != null && doorWeight <= sku.maxDoorWeight) {
    reasons.push(`✓ Door weight compatible (max ${sku.maxDoorWeight}kg)`);
  } else if (sku.maxDoorWeight != null) {
    reasons.push(`⚠ Door weight exceeds max (${sku.maxDoorWeight}kg)`);
  }

  // Door size compatibility
  if (sku.maxDoorWidth != null && widthMm <= sku.maxDoorWidth) {
    reasons.push(`✓ Door width compatible (max ${sku.maxDoorWidth}mm)`);
  }
  if (sku.maxDoorHeight != null && heightMm <= sku.maxDoorHeight) {
    reasons.push(`✓ Door height compatible (max ${sku.maxDoorHeight}mm)`);
  }

  // Finish match
  if (sku.finish && sku.finish.toLowerCase() === finish.toLowerCase()) {
    reasons.push(`✓ Finish matches (${sku.finish})`);
  }

  return reasons;
}
