import type {
  FullRule,
  ConfigurationRecord,
} from "@/src/types/configurator";

/**
 * Match recommendation rules against a user configuration.
 *
 * Matching logic:
 * - A rule matches when ALL its conditions match (AND logic).
 * - Numeric comparisons (gte/lte) cast values to numbers.
 * - eq/neq are string comparisons against the config record.
 * - Results are sorted by priority DESC.
 *
 * This runs entirely in TypeScript — the data volume (25 rules × ~3 conditions)
 * is trivial and TS is more testable/debuggable than raw SQL CASE expressions.
 */
export function matchRules(
  config: ConfigurationRecord,
  rules: FullRule[]
): FullRule[] {
  const matched: FullRule[] = [];

  for (const rule of rules) {
    if (rule.conditions.length === 0) continue;
    if (evaluateConditions(config, rule)) {
      matched.push(rule);
    }
  }

  // Already sorted by priority DESC from DB query, but ensure it
  matched.sort((a, b) => b.priority - a.priority);
  return matched;
}

function evaluateConditions(
  config: ConfigurationRecord,
  rule: FullRule
): boolean {
  for (const cond of rule.conditions) {
    const configValue = config[cond.attributeCode as keyof ConfigurationRecord];

    if (configValue === undefined || configValue === null) {
      return false;
    }

    const matches = evaluateCondition(cond.operator, String(configValue), cond.value);
    if (!matches) return false;
  }

  return true;
}

function evaluateCondition(
  operator: string,
  configValue: string,
  conditionValue: string
): boolean {
  switch (operator) {
    case "eq":
      return configValue === conditionValue;

    case "neq":
      return configValue !== conditionValue;

    case "gte": {
      const cfgNum = Number(configValue);
      const condNum = Number(conditionValue);
      if (isNaN(cfgNum) || isNaN(condNum)) return false;
      return cfgNum >= condNum;
    }

    case "lte": {
      const cfgNum = Number(configValue);
      const condNum = Number(conditionValue);
      if (isNaN(cfgNum) || isNaN(condNum)) return false;
      return cfgNum <= condNum;
    }

    default:
      return false;
  }
}
