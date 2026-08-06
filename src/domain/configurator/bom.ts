import type { HardwareItem, BomResult, ProductSku } from "@/src/types/configurator";
import type { ResolvedItem } from "./quantity-engine";

/**
 * Generate a BOM from resolved hardware items and SKU details.
 */
export function generateBom(
  resolvedItems: ResolvedItem[],
  skuMap: Map<string, ProductSku>
): BomResult {
  const items: HardwareItem[] = [];

  for (const ri of resolvedItems) {
    const sku = skuMap.get(ri.sku);
    if (!sku) continue;

    const totalPrice = Math.round(ri.quantity * sku.price * 100) / 100;

    items.push({
      sku: ri.sku,
      name: sku.name,
      productType: sku.productType,
      quantity: ri.quantity,
      required: ri.required,
      unit: sku.unit,
      unitPrice: sku.price,
      totalPrice,
      whyRecommended: [],
    });
  }

  const subtotal = calculateBomSubtotal(items);

  return { items, subtotal };
}

/**
 * Calculate subtotal from BOM items.
 */
export function calculateBomSubtotal(items: HardwareItem[]): number {
  return Math.round(items.reduce((sum, item) => sum + item.totalPrice, 0) * 100) / 100;
}
