import { pool } from "@/src/infrastructure/db/client";
import { success, error } from "@/src/lib/api-response";

const ALLOWED_TABLES = [
  "product_family",
  "configurator_attribute",
  "attribute_option",
  "product_sku",
  "recommendation_rule",
  "recommendation_rule_condition",
  "recommendation_rule_item",
  "recommendation_quantity_rule",
  "sku_compatibility",
  "bom",
  "bom_item",
  "test_configuration",
  "quotes",
  "quote_items",
] as const;

export async function GET() {
  try {
    const results: { table: string; count: number; columns: string[] }[] = [];

    for (const table of ALLOWED_TABLES) {
      const { rows: countRows } = await pool.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM "${table}"`
      );
      const { rows: colRows } = await pool.query<{ column_name: string }>(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        [table]
      );
      results.push({
        table,
        count: parseInt(countRows[0].count, 10),
        columns: colRows.map((r) => r.column_name),
      });
    }

    return success(results);
  } catch (e) {
    console.error(e);
    return error("Internal server error", 500);
  }
}
