import { pool } from "@/src/infrastructure/db/client";
import type { Bom, BomItem } from "@/src/types/configurator";

export async function getBomTemplates(familyId: number): Promise<Bom[]> {
  const { rows } = await pool.query(
    `SELECT id, family_id, code, name, version, status
     FROM bom
     WHERE family_id = $1 AND status = 'active'
     ORDER BY id`,
    [familyId]
  );
  return rows.map(mapBom);
}

export async function getBomByCode(code: string): Promise<Bom | null> {
  const { rows } = await pool.query(
    `SELECT id, family_id, code, name, version, status
     FROM bom
     WHERE code = $1`,
    [code]
  );
  if (rows.length === 0) return null;
  return mapBom(rows[0]);
}

export async function getBomItems(bomId: number): Promise<BomItem[]> {
  const { rows } = await pool.query(
    `SELECT id, bom_id, sku, quantity, required, note
     FROM bom_item
     WHERE bom_id = $1
     ORDER BY id`,
    [bomId]
  );
  return rows.map(mapBomItem);
}

// --- Mappers ---

function mapBom(row: Record<string, unknown>): Bom {
  return {
    id: Number(row.id),
    familyId: Number(row.family_id),
    code: String(row.code),
    name: String(row.name),
    version: String(row.version),
    status: String(row.status),
  };
}

function mapBomItem(row: Record<string, unknown>): BomItem {
  return {
    id: Number(row.id),
    bomId: Number(row.bom_id),
    sku: String(row.sku),
    quantity: Number(row.quantity),
    required: Boolean(row.required),
    note: row.note ? String(row.note) : null,
  };
}
