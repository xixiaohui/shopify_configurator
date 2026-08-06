const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://shopify:shopify123456@208.167.233.53:5432/shopify_db';

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    console.log('✓ Connected to PostgreSQL');

    const sql = fs.readFileSync(
      path.join(__dirname, 'glass_swing_door_configurator.sql'),
      'utf-8'
    );

    await client.query(sql);
    console.log('✓ SQL executed successfully');

    // Verify
    const res = await client.query(`
      SELECT 'product_family' AS tbl, COUNT(*) AS cnt FROM product_family
      UNION ALL SELECT 'configurator_attribute', COUNT(*) FROM configurator_attribute
      UNION ALL SELECT 'attribute_option', COUNT(*) FROM attribute_option
      UNION ALL SELECT 'product_sku', COUNT(*) FROM product_sku
      UNION ALL SELECT 'recommendation_rule', COUNT(*) FROM recommendation_rule
      UNION ALL SELECT 'recommendation_rule_condition', COUNT(*) FROM recommendation_rule_condition
      UNION ALL SELECT 'recommendation_rule_item', COUNT(*) FROM recommendation_rule_item
      UNION ALL SELECT 'recommendation_quantity_rule', COUNT(*) FROM recommendation_quantity_rule
      UNION ALL SELECT 'bom', COUNT(*) FROM bom
      UNION ALL SELECT 'bom_item', COUNT(*) FROM bom_item
      UNION ALL SELECT 'test_configuration', COUNT(*) FROM test_configuration
      ORDER BY tbl
    `);
    console.log('\n--- Table Row Counts ---');
    for (const row of res.rows) {
      console.log(`  ${row.tbl.padEnd(36)} ${row.cnt}`);
    }
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
