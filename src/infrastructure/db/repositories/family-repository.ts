import { pool } from "@/src/infrastructure/db/client";
import type {
  ProductFamily,
  ConfiguratorAttribute,
  AttributeOption,
  AttributeWithOptions,
} from "@/src/types/configurator";

export async function getProductFamilies(): Promise<ProductFamily[]> {
  const { rows } = await pool.query<{
    id: number; code: string; name: string; description: string | null; status: string;
  }>(
    `SELECT id, code, name, description, status
     FROM product_family
     WHERE status = 'active'
     ORDER BY id`
  );
  return rows.map(mapFamily);
}

export async function getProductFamilyByCode(
  code: string
): Promise<ProductFamily | null> {
  const { rows } = await pool.query<{
    id: number; code: string; name: string; description: string | null; status: string;
  }>(
    `SELECT id, code, name, description, status
     FROM product_family
     WHERE code = $1`,
    [code]
  );
  if (rows.length === 0) return null;
  return mapFamily(rows[0]);
}

export async function getConfiguratorAttributes(
  familyId: number
): Promise<ConfiguratorAttribute[]> {
  const { rows } = await pool.query<{
    id: number; family_id: number; code: string; name: string;
    data_type: string; required: boolean; sort_order: number;
  }>(
    `SELECT id, family_id, code, name, data_type, required, sort_order
     FROM configurator_attribute
     WHERE family_id = $1
     ORDER BY sort_order`,
    [familyId]
  );
  return rows.map(mapAttribute);
}

export async function getAttributeOptions(
  attributeId: number
): Promise<AttributeOption[]> {
  const { rows } = await pool.query<{
    id: number; attribute_id: number; code: string; label: string;
    numeric_value: number | null; sort_order: number;
  }>(
    `SELECT id, attribute_id, code, label, numeric_value, sort_order
     FROM attribute_option
     WHERE attribute_id = $1
     ORDER BY sort_order`,
    [attributeId]
  );
  return rows.map(mapOption);
}

export async function getAttributesWithOptions(
  familyCode: string
): Promise<{ family: ProductFamily; attributes: AttributeWithOptions[] } | null> {
  const family = await getProductFamilyByCode(familyCode);
  if (!family) return null;

  const attributes = await getConfiguratorAttributes(family.id);

  const withOptions: AttributeWithOptions[] = [];
  for (const attr of attributes) {
    const options = await getAttributeOptions(attr.id);
    withOptions.push({ ...attr, options });
  }

  return { family, attributes: withOptions };
}

// --- Mappers ---

function mapFamily(row: { id: number; code: string; name: string; description: string | null; status: string }): ProductFamily {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    status: row.status as ProductFamily["status"],
  };
}

function mapAttribute(row: { id: number; family_id: number; code: string; name: string; data_type: string; required: boolean; sort_order: number }): ConfiguratorAttribute {
  return {
    id: row.id,
    familyId: row.family_id,
    code: row.code,
    name: row.name,
    dataType: row.data_type as ConfiguratorAttribute["dataType"],
    required: row.required,
    sortOrder: row.sort_order,
  };
}

function mapOption(row: { id: number; attribute_id: number; code: string; label: string; numeric_value: number | null; sort_order: number }): AttributeOption {
  return {
    id: row.id,
    attributeId: row.attribute_id,
    code: row.code,
    label: row.label,
    numericValue: row.numeric_value,
    sortOrder: row.sort_order,
  };
}
