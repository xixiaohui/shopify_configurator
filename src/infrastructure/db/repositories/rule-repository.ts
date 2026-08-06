import { pool } from "@/src/infrastructure/db/client";
import type {
  RecommendationRule,
  RuleCondition,
  RuleItem,
  QuantityRule,
  FullRule,
  FullRuleItem,
} from "@/src/types/configurator";

export async function getRulesByFamily(
  familyId: number
): Promise<RecommendationRule[]> {
  const { rows } = await pool.query(
    `SELECT id, family_id, code, name, priority, enabled, description
     FROM recommendation_rule
     WHERE family_id = $1 AND enabled = true
     ORDER BY priority DESC`,
    [familyId]
  );
  return rows.map(mapRule);
}

export async function getRuleConditions(
  ruleIds: number[]
): Promise<RuleCondition[]> {
  if (ruleIds.length === 0) return [];
  const placeholders = ruleIds.map((_, i) => `$${i + 1}`).join(", ");
  const { rows } = await pool.query(
    `SELECT id, rule_id, attribute_code, operator, value
     FROM recommendation_rule_condition
     WHERE rule_id IN (${placeholders})
     ORDER BY id`,
    ruleIds
  );
  return rows.map(mapCondition);
}

export async function getRuleItems(
  ruleIds: number[]
): Promise<RuleItem[]> {
  if (ruleIds.length === 0) return [];
  const placeholders = ruleIds.map((_, i) => `$${i + 1}`).join(", ");
  const { rows } = await pool.query(
    `SELECT id, rule_id, sku, quantity, required, sort_order
     FROM recommendation_rule_item
     WHERE rule_id IN (${placeholders})
     ORDER BY sort_order`,
    ruleIds
  );
  return rows.map(mapItem);
}

export async function getQuantityRules(
  ruleItemIds: number[]
): Promise<QuantityRule[]> {
  if (ruleItemIds.length === 0) return [];
  const placeholders = ruleItemIds.map((_, i) => `$${i + 1}`).join(", ");
  const { rows } = await pool.query(
    `SELECT id, rule_item_id, min_door_weight, max_door_weight,
            min_width, max_width, min_height, max_height,
            quantity, priority
     FROM recommendation_quantity_rule
     WHERE rule_item_id IN (${placeholders})
     ORDER BY priority DESC`,
    ruleItemIds
  );
  return rows.map(mapQuantityRule);
}

export async function getFullRulesByFamily(
  familyId: number
): Promise<FullRule[]> {
  const rules = await getRulesByFamily(familyId);
  if (rules.length === 0) return [];

  const ruleIds = rules.map((r) => r.id);

  const [conditions, items] = await Promise.all([
    getRuleConditions(ruleIds),
    getRuleItems(ruleIds),
  ]);

  const itemIds = items.map((i) => i.id);
  const qtyRules = await getQuantityRules(itemIds);

  return rules.map((rule) => {
    const ruleConditions = conditions.filter((c) => c.ruleId === rule.id);
    const ruleItems: FullRuleItem[] = items
      .filter((i) => i.ruleId === rule.id)
      .map((item) => ({
        ...item,
        quantityRules: qtyRules.filter((q) => q.ruleItemId === item.id),
      }));

    return { ...rule, conditions: ruleConditions, items: ruleItems };
  });
}

// --- Mappers ---

function mapRule(row: Record<string, unknown>): RecommendationRule {
  return {
    id: Number(row.id),
    familyId: Number(row.family_id),
    code: String(row.code),
    name: String(row.name),
    priority: Number(row.priority),
    enabled: Boolean(row.enabled),
    description: row.description ? String(row.description) : null,
  };
}

function mapCondition(row: Record<string, unknown>): RuleCondition {
  return {
    id: Number(row.id),
    ruleId: Number(row.rule_id),
    attributeCode: String(row.attribute_code),
    operator: String(row.operator) as RuleCondition["operator"],
    value: String(row.value),
  };
}

function mapItem(row: Record<string, unknown>): RuleItem {
  return {
    id: Number(row.id),
    ruleId: Number(row.rule_id),
    sku: String(row.sku),
    quantity: Number(row.quantity),
    required: Boolean(row.required),
    sortOrder: Number(row.sort_order),
  };
}

function mapQuantityRule(row: Record<string, unknown>): QuantityRule {
  return {
    id: Number(row.id),
    ruleItemId: Number(row.rule_item_id),
    minDoorWeight: row.min_door_weight != null ? Number(row.min_door_weight) : null,
    maxDoorWeight: row.max_door_weight != null ? Number(row.max_door_weight) : null,
    minWidth: row.min_width != null ? Number(row.min_width) : null,
    maxWidth: row.max_width != null ? Number(row.max_width) : null,
    minHeight: row.min_height != null ? Number(row.min_height) : null,
    maxHeight: row.max_height != null ? Number(row.max_height) : null,
    quantity: Number(row.quantity),
    priority: Number(row.priority),
  };
}
