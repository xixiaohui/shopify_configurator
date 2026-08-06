import { pool } from "@/src/infrastructure/db/client";
import type { ProductSku, SkuCompatibility } from "@/src/types/configurator";

export async function getProductSku(sku: string): Promise<ProductSku | null> {
  const { rows } = await pool.query(
    `SELECT id, sku, product_type, name, description, material, finish,
            min_glass_thickness, max_glass_thickness,
            max_door_width, max_door_height, max_door_weight,
            unit, price, inventory, status
     FROM product_sku
     WHERE sku = $1`,
    [sku]
  );
  if (rows.length === 0) return null;
  return mapSku(rows[0]);
}

export async function getSkusBySkus(skus: string[]): Promise<ProductSku[]> {
  if (skus.length === 0) return [];
  const placeholders = skus.map((_, i) => `$${i + 1}`).join(", ");
  const { rows } = await pool.query(
    `SELECT id, sku, product_type, name, description, material, finish,
            min_glass_thickness, max_glass_thickness,
            max_door_width, max_door_height, max_door_weight,
            unit, price, inventory, status
     FROM product_sku
     WHERE sku IN (${placeholders})`,
    skus
  );
  return rows.map(mapSku);
}

export async function getAllSkus(): Promise<ProductSku[]> {
  const { rows } = await pool.query(
    `SELECT id, sku, product_type, name, description, material, finish,
            min_glass_thickness, max_glass_thickness,
            max_door_width, max_door_height, max_door_weight,
            unit, price, inventory, status
     FROM product_sku
     WHERE status = 'active'
     ORDER BY product_type, sku`
  );
  return rows.map(mapSku);
}

export async function getSkuCompatibility(
  sku: string
): Promise<SkuCompatibility[]> {
  const { rows } = await pool.query(
    `SELECT id, sku, compatible_sku, relation, note
     FROM sku_compatibility
     WHERE sku = $1
     ORDER BY id`,
    [sku]
  );
  return rows.map(mapCompat);
}

export async function getBulkSkuCompatibility(
  skus: string[]
): Promise<SkuCompatibility[]> {
  if (skus.length === 0) return [];
  const placeholders = skus.map((_, i) => `$${i + 1}`).join(", ");
  const { rows } = await pool.query(
    `SELECT id, sku, compatible_sku, relation, note
     FROM sku_compatibility
     WHERE sku IN (${placeholders})
        OR compatible_sku IN (${placeholders})
     ORDER BY id`,
    skus
  );
  return rows.map(mapCompat);
}

// --- Mappers ---

function mapSku(row: Record<string, unknown>): ProductSku {
  return {
    id: Number(row.id),
    sku: String(row.sku),
    productType: String(row.product_type),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    material: row.material ? String(row.material) : null,
    finish: row.finish ? String(row.finish) : null,
    minGlassThickness: row.min_glass_thickness != null ? Number(row.min_glass_thickness) : null,
    maxGlassThickness: row.max_glass_thickness != null ? Number(row.max_glass_thickness) : null,
    maxDoorWidth: row.max_door_width != null ? Number(row.max_door_width) : null,
    maxDoorHeight: row.max_door_height != null ? Number(row.max_door_height) : null,
    maxDoorWeight: row.max_door_weight != null ? Number(row.max_door_weight) : null,
    unit: String(row.unit),
    price: Number(row.price),
    inventory: Number(row.inventory),
    status: String(row.status) as ProductSku["status"],
  };
}

function mapCompat(row: Record<string, unknown>): SkuCompatibility {
  return {
    id: Number(row.id),
    sku: String(row.sku),
    compatibleSku: String(row.compatible_sku),
    relation: String(row.relation) as SkuCompatibility["relation"],
    note: row.note ? String(row.note) : null,
  };
}
