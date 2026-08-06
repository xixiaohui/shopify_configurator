import type { FullRuleItem, QuantityRule } from "@/src/types/configurator";

export interface QuantityInput {
  doorWeight: number;
  widthMm: number;
  heightMm: number;
}

export interface ResolvedItem {
  sku: string;
  quantity: number;
  required: boolean;
  sortOrder: number;
}

/**
 * Calculate final hardware quantities by applying quantity rules on top of
 * default rule item quantities.
 *
 * For each rule item:
 * 1. Look for matching quantity rules (matching weight/width/height ranges).
 * 2. If a matching quantity rule is found, use its quantity.
 * 3. Otherwise, use the rule item's default quantity.
 * 4. Highest priority quantity rule wins.
 */
export function calculateQuantities(
  ruleItems: FullRuleItem[],
  input: QuantityInput
): ResolvedItem[] {
  return ruleItems
    .map((item) => {
      const qty = resolveQuantity(item, input);
      return {
        sku: item.sku,
        quantity: qty,
        required: item.required,
        sortOrder: item.sortOrder,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function resolveQuantity(item: FullRuleItem, input: QuantityInput): number {
  if (item.quantityRules.length === 0) {
    return item.quantity;
  }

  // Quantity rules are pre-sorted by priority DESC
  for (const qr of item.quantityRules) {
    if (matchesRange(qr, input)) {
      return qr.quantity;
    }
  }

  return item.quantity;
}

function matchesRange(qr: QuantityRule, input: QuantityInput): boolean {
  if (qr.minDoorWeight != null && input.doorWeight < qr.minDoorWeight) return false;
  if (qr.maxDoorWeight != null && input.doorWeight > qr.maxDoorWeight) return false;
  if (qr.minWidth != null && input.widthMm < qr.minWidth) return false;
  if (qr.maxWidth != null && input.widthMm > qr.maxWidth) return false;
  if (qr.minHeight != null && input.heightMm < qr.minHeight) return false;
  if (qr.maxHeight != null && input.heightMm > qr.maxHeight) return false;
  return true;
}
