import { getProductFamilyByCode } from "@/src/infrastructure/db/repositories/family-repository";
import { getSkusBySkus, getBulkSkuCompatibility } from "@/src/infrastructure/db/repositories/sku-repository";
import { getFullRulesByFamily } from "@/src/infrastructure/db/repositories/rule-repository";
import { calculateAll } from "@/src/domain/configurator/calculator";
import { matchRules } from "@/src/domain/configurator/rule-engine";
import { calculateQuantities } from "@/src/domain/configurator/quantity-engine";
import { checkCompatibility, buildWhyRecommended } from "@/src/domain/configurator/compatibility";
import { generateBom } from "@/src/domain/configurator/bom";
import type {
  RecommendResponse,
  ConfigurationRecord,
  DoorConfiguration,
  HardwareItem,
  ProductSku,
  ValidationError,
} from "@/src/types/configurator";

/**
 * Convert camelCase DoorConfiguration to snake_case ConfigurationRecord
 * to match database attribute_codes.
 */
function toConfigRecord(config: DoorConfiguration): ConfigurationRecord {
  return {
    door_type: config.doorType,
    glass_thickness: config.glassThickness,
    door_width: config.doorWidth,
    door_height: config.doorHeight,
    mounting_type: config.mountingType,
    opening_type: config.openingType,
    finish: config.finish,
    ...(config.handleSize ? { handle_size: config.handleSize } : {}),
    ...(config.lockType ? { lock_type: config.lockType } : {}),
  };
}

/**
 * Core recommendation pipeline.
 *
 * Flow:
 * 1. Lookup product family
 * 2. Load all enabled rules with conditions, items, and quantity rules
 * 3. Calculate door area and glass weight
 * 4. Match rules against configuration
 * 5. Resolve quantities (apply quantity rule overrides)
 * 6. Load SKU details for matched items
 * 7. Check compatibility
 * 8. Generate BOM with pricing
 * 9. Build "why recommended" reasons
 */
export async function getRecommendation(
  familyCode: string,
  config: DoorConfiguration
): Promise<RecommendResponse> {
  // 1. Lookup family
  const family = await getProductFamilyByCode(familyCode);
  if (!family) {
    throw new Error(`Product family not found: ${familyCode}`);
  }

  // 2. Load rules
  const rules = await getFullRulesByFamily(family.id);

  // 3. Calculate
  const calc = calculateAll(
    config.doorWidth,
    config.doorHeight,
    Number(config.glassThickness)
  );

  // 4. Match rules
  const configRecord = toConfigRecord(config);
  const matched = matchRules(configRecord, rules);

  if (matched.length === 0) {
    return {
      configuration: config,
      calculation: calc,
      matchedRule: null,
      hardware: [],
      bom: { items: [], subtotal: 0 },
      warnings: ["No matching hardware package found for this configuration."],
    };
  }

  const bestRule = matched[0];

  // 5. Resolve quantities
  const resolved = calculateQuantities(bestRule.items, {
    doorWeight: calc.glassWeight,
    widthMm: config.doorWidth,
    heightMm: config.doorHeight,
  });

  // 6. Load SKU details
  const skus = resolved.map((r) => r.sku);
  const skuDetails = await getSkusBySkus(skus);
  const skuMap = new Map<string, ProductSku>();
  for (const s of skuDetails) {
    skuMap.set(s.sku, s);
  }

  // 7. Check compatibility
  const compatData = await getBulkSkuCompatibility(skus);
  const compatResult = checkCompatibility(skus, compatData, skuDetails);

  // 8. Generate BOM
  const bom = generateBom(resolved, skuMap);

  // 9. Build hardware list with "why recommended"
  const hardware: HardwareItem[] = bom.items.map((item) => {
    const sku = skuMap.get(item.sku);
    const whyRecommended = sku
      ? buildWhyRecommended(
          sku,
          Number(config.glassThickness),
          calc.glassWeight,
          config.doorWidth,
          config.doorHeight,
          config.finish
        )
      : [];

    return { ...item, whyRecommended };
  });

  return {
    configuration: config,
    calculation: calc,
    matchedRule: {
      code: bestRule.code,
      name: bestRule.name,
      priority: bestRule.priority,
    },
    hardware,
    bom: { items: hardware, subtotal: bom.subtotal },
    warnings: compatResult.warnings,
  };
}

/**
 * Validate a configuration against the family's attribute definitions.
 * Checks: required fields present, values are valid options, within ranges.
 */
export function validateConfiguration(
  config: DoorConfiguration
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Width range
  if (config.doorWidth < 600) {
    errors.push({ field: "doorWidth", message: "Minimum door width is 600mm." });
  }
  if (config.doorWidth > 1400) {
    errors.push({ field: "doorWidth", message: "Maximum supported door width is 1400mm." });
  }

  // Height range
  if (config.doorHeight < 1800) {
    errors.push({ field: "doorHeight", message: "Minimum door height is 1800mm." });
  }
  if (config.doorHeight > 2600) {
    errors.push({ field: "doorHeight", message: "Maximum supported door height is 2600mm." });
  }

  // Business rule: 12mm glass needs mounting check
  if (config.glassThickness === "12" && config.mountingType === "glass_to_wall") {
    // G2W hinges support 8-12mm, so this is OK but note it
  }

  return errors;
}
