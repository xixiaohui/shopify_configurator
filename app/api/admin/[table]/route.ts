import { pool } from "@/src/infrastructure/db/client";
import { success, error } from "@/src/lib/api-response";

// Whitelist — must match the tables route
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

type AllowedTable = (typeof ALLOWED_TABLES)[number];

function isAllowed(table: string): table is AllowedTable {
  return ALLOWED_TABLES.includes(table as AllowedTable);
}

// Tables that are read-only (quotes come from configurator flow)
const READ_ONLY_TABLES: string[] = ["quotes", "quote_items"];

// ============================================================
// GET /api/admin/[table]       — list rows (paginated)
// GET /api/admin/[table]?id=5  — single row
// ============================================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    if (!isAllowed(table)) {
      return error(`Table "${table}" is not allowed`, 403);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "100", 10), 1000);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    if (id) {
      const { rows } = await pool.query(
        `SELECT * FROM "${table}" WHERE id = $1`,
        [parseInt(id, 10)]
      );
      if (rows.length === 0) return error("Row not found", 404);
      return success(rows[0]);
    }

    const { rows } = await pool.query(
      `SELECT * FROM "${table}" ORDER BY id DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const { rows: countRows } = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM "${table}"`
    );

    return success({
      rows,
      total: parseInt(countRows[0].count, 10),
      limit,
      offset,
    });
  } catch (e) {
    console.error(e);
    return error("Internal server error", 500);
  }
}

// ============================================================
// POST /api/admin/[table] — insert row
// ============================================================
export async function POST(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    if (!isAllowed(table)) {
      return error(`Table "${table}" is not allowed`, 403);
    }
    if (READ_ONLY_TABLES.includes(table)) {
      return error(`Table "${table}" is read-only`, 403);
    }

    const body = await request.json();
    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      return error("Request body must be a non-empty object", 400);
    }

    const columns = Object.keys(body);
    const values = Object.values(body);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    const quotedCols = columns.map((c) => `"${c}"`).join(", ");

    const { rows } = await pool.query(
      `INSERT INTO "${table}" (${quotedCols}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    return success(rows[0], 201);
  } catch (e) {
    console.error(e);
    return error(
      e instanceof Error ? e.message : "Insert failed",
      400
    );
  }
}

// ============================================================
// PUT /api/admin/[table] — update row
// ============================================================
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    if (!isAllowed(table)) {
      return error(`Table "${table}" is not allowed`, 403);
    }
    if (READ_ONLY_TABLES.includes(table)) {
      return error(`Table "${table}" is read-only`, 403);
    }

    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return error("Missing 'id' field in request body", 400);
    }
    if (Object.keys(fields).length === 0) {
      return error("No fields to update", 400);
    }

    const setClauses = Object.keys(fields).map(
      (col, i) => `"${col}" = $${i + 1}`
    );
    const values = Object.values(fields);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE "${table}" SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (rows.length === 0) return error("Row not found", 404);
    return success(rows[0]);
  } catch (e) {
    console.error(e);
    return error(
      e instanceof Error ? e.message : "Update failed",
      400
    );
  }
}

// ============================================================
// DELETE /api/admin/[table]?id=5 — delete row
// ============================================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    if (!isAllowed(table)) {
      return error(`Table "${table}" is not allowed`, 403);
    }
    if (READ_ONLY_TABLES.includes(table)) {
      return error(`Table "${table}" is read-only`, 403);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return error("Missing 'id' query parameter", 400);
    }

    const { rowCount } = await pool.query(
      `DELETE FROM "${table}" WHERE id = $1`,
      [parseInt(id, 10)]
    );

    if (rowCount === 0) return error("Row not found", 404);
    return success({ deleted: true, id: parseInt(id, 10) });
  } catch (e) {
    console.error(e);
    return error(
      e instanceof Error ? e.message : "Delete failed",
      400
    );
  }
}
