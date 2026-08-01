-- Glass Swing Door Product Configurator Demo
-- PostgreSQL 16+
-- Purpose: complete demo schema + seed data + rule matching + BOM queries
-- Safe for a fresh demo database. This script DROPS the demo tables first.

BEGIN;

DROP TABLE IF EXISTS test_configuration CASCADE;
DROP TABLE IF EXISTS bom_item CASCADE;
DROP TABLE IF EXISTS bom CASCADE;
DROP TABLE IF EXISTS sku_compatibility CASCADE;
DROP TABLE IF EXISTS recommendation_quantity_rule CASCADE;
DROP TABLE IF EXISTS recommendation_rule_item CASCADE;
DROP TABLE IF EXISTS recommendation_rule_condition CASCADE;
DROP TABLE IF EXISTS recommendation_rule CASCADE;
DROP TABLE IF EXISTS product_sku CASCADE;
DROP TABLE IF EXISTS attribute_option CASCADE;
DROP TABLE IF EXISTS configurator_attribute CASCADE;
DROP TABLE IF EXISTS product_family CASCADE;

-- ============================================================
-- 1. Product family
-- ============================================================
CREATE TABLE product_family (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. Configurator attributes
-- ============================================================
CREATE TABLE configurator_attribute (
    id BIGSERIAL PRIMARY KEY,
    family_id BIGINT NOT NULL REFERENCES product_family(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    data_type VARCHAR(20) NOT NULL
        CHECK (data_type IN ('select', 'number', 'boolean', 'text')),
    required BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    UNIQUE (family_id, code)
);

CREATE TABLE attribute_option (
    id BIGSERIAL PRIMARY KEY,
    attribute_id BIGINT NOT NULL REFERENCES configurator_attribute(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    numeric_value NUMERIC(12,3),
    sort_order INT NOT NULL DEFAULT 0,
    UNIQUE (attribute_id, code)
);

-- ============================================================
-- 3. Actual sellable hardware SKUs
-- ============================================================
CREATE TABLE product_sku (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(80) UNIQUE NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    material VARCHAR(80),
    finish VARCHAR(50),
    min_glass_thickness NUMERIC(6,2),
    max_glass_thickness NUMERIC(6,2),
    max_door_width NUMERIC(10,2),
    max_door_height NUMERIC(10,2),
    max_door_weight NUMERIC(10,2),
    unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    inventory INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_sku_type ON product_sku(product_type);
CREATE INDEX idx_product_sku_finish ON product_sku(finish);
CREATE INDEX idx_product_sku_glass_range
    ON product_sku(min_glass_thickness, max_glass_thickness);

-- ============================================================
-- 4. Recommendation rules
-- A rule belongs to a product family.
-- Higher priority wins when multiple rules match.
-- ============================================================
CREATE TABLE recommendation_rule (
    id BIGSERIAL PRIMARY KEY,
    family_id BIGINT NOT NULL REFERENCES product_family(id) ON DELETE CASCADE,
    code VARCHAR(80) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    priority INT NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT true,
    description TEXT
);

CREATE INDEX idx_rule_family_enabled_priority
    ON recommendation_rule(family_id, enabled, priority DESC);

-- Operators supported in the demo:
-- eq, neq, gte, lte
CREATE TABLE recommendation_rule_condition (
    id BIGSERIAL PRIMARY KEY,
    rule_id BIGINT NOT NULL REFERENCES recommendation_rule(id) ON DELETE CASCADE,
    attribute_code VARCHAR(50) NOT NULL,
    operator VARCHAR(10) NOT NULL
        CHECK (operator IN ('eq', 'neq', 'gte', 'lte')),
    value VARCHAR(100) NOT NULL
);

CREATE INDEX idx_rule_condition_rule ON recommendation_rule_condition(rule_id);
CREATE INDEX idx_rule_condition_attribute
    ON recommendation_rule_condition(attribute_code, value);

-- ============================================================
-- 5. Rule -> recommended SKU
-- ============================================================
CREATE TABLE recommendation_rule_item (
    id BIGSERIAL PRIMARY KEY,
    rule_id BIGINT NOT NULL REFERENCES recommendation_rule(id) ON DELETE CASCADE,
    sku VARCHAR(80) NOT NULL REFERENCES product_sku(sku),
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    required BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    UNIQUE (rule_id, sku)
);

CREATE INDEX idx_rule_item_rule ON recommendation_rule_item(rule_id);

-- ============================================================
-- 6. Quantity rules
-- Useful for hinges: 2 / 3 hinges based on door weight.
-- If no row matches, the default quantity in rule_item is used.
-- ============================================================
CREATE TABLE recommendation_quantity_rule (
    id BIGSERIAL PRIMARY KEY,
    rule_item_id BIGINT NOT NULL REFERENCES recommendation_rule_item(id) ON DELETE CASCADE,
    min_door_weight NUMERIC(10,2),
    max_door_weight NUMERIC(10,2),
    min_width NUMERIC(10,2),
    max_width NUMERIC(10,2),
    min_height NUMERIC(10,2),
    max_height NUMERIC(10,2),
    quantity NUMERIC(10,2) NOT NULL,
    priority INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_qty_rule_item ON recommendation_quantity_rule(rule_item_id);

-- ============================================================
-- 7. SKU compatibility
-- ============================================================
CREATE TABLE sku_compatibility (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(80) NOT NULL REFERENCES product_sku(sku),
    compatible_sku VARCHAR(80) NOT NULL REFERENCES product_sku(sku),
    relation VARCHAR(30) NOT NULL
        CHECK (relation IN ('compatible', 'incompatible', 'alternative')),
    note TEXT,
    UNIQUE (sku, compatible_sku)
);

-- ============================================================
-- 8. BOM
-- This is a reusable assembly template. The configurator can
-- also generate a dynamic BOM from recommendation rules.
-- ============================================================
CREATE TABLE bom (
    id BIGSERIAL PRIMARY KEY,
    family_id BIGINT NOT NULL REFERENCES product_family(id),
    code VARCHAR(80) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    version VARCHAR(30) NOT NULL DEFAULT '1.0',
    status VARCHAR(20) NOT NULL DEFAULT 'active'
);

CREATE TABLE bom_item (
    id BIGSERIAL PRIMARY KEY,
    bom_id BIGINT NOT NULL REFERENCES bom(id) ON DELETE CASCADE,
    sku VARCHAR(80) NOT NULL REFERENCES product_sku(sku),
    quantity NUMERIC(10,2) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT true,
    note TEXT,
    UNIQUE (bom_id, sku)
);

-- ============================================================
-- 9. Test configurations
-- ============================================================
CREATE TABLE test_configuration (
    id BIGSERIAL PRIMARY KEY,
    family_id BIGINT NOT NULL REFERENCES product_family(id),
    name VARCHAR(200) NOT NULL,
    config JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_test_configuration_config
    ON test_configuration USING GIN (config);

-- ============================================================
-- 10. Product family
-- ============================================================
INSERT INTO product_family (code, name, description)
VALUES
('GLASS_SWING_DOOR', 'Glass Swing Door',
 'Frameless glass swing door hardware configurator demo');

-- ============================================================
-- 11. Attributes
-- ============================================================
INSERT INTO configurator_attribute
    (family_id, code, name, data_type, required, sort_order)
SELECT
    pf.id, x.code, x.name, x.data_type, x.required, x.sort_order
FROM product_family pf
CROSS JOIN (
    VALUES
    ('door_type',         'Door Type',          'select', true, 10),
    ('glass_thickness',  'Glass Thickness',    'select', true, 20),
    ('door_width',       'Door Width (mm)',    'number', true, 30),
    ('door_height',      'Door Height (mm)',   'number', true, 40),
    ('mounting_type',    'Mounting Type',      'select', true, 50),
    ('opening_type',     'Opening Type',       'select', true, 60),
    ('finish',           'Finish',              'select', true, 70),
    ('handle_size',      'Handle Size',        'select', false, 80),
    ('lock_type',        'Lock Type',          'select', false, 90)
) AS x(code, name, data_type, required, sort_order)
WHERE pf.code = 'GLASS_SWING_DOOR';

INSERT INTO attribute_option
    (attribute_id, code, label, numeric_value, sort_order)
SELECT ca.id, x.code, x.label, x.numeric_value, x.sort_order
FROM configurator_attribute ca
JOIN product_family pf ON pf.id = ca.family_id
JOIN (
    VALUES
    ('door_type', 'single', 'Single Door', NULL::numeric, 10),
    ('door_type', 'double', 'Double Door', NULL::numeric, 20),

    ('glass_thickness', '8',  '8mm',  8, 10),
    ('glass_thickness', '10', '10mm', 10, 20),
    ('glass_thickness', '12', '12mm', 12, 30),

    ('mounting_type', 'glass_to_glass', 'Glass-to-Glass', NULL::numeric, 10),
    ('mounting_type', 'glass_to_wall',   'Glass-to-Wall',   NULL::numeric, 20),

    ('opening_type', 'left',   'Left Hand',  NULL::numeric, 10),
    ('opening_type', 'right',  'Right Hand', NULL::numeric, 20),
    ('opening_type', 'double', 'Double Swing',NULL::numeric, 30),

    ('finish', 'sss',   'Satin Stainless Steel', NULL::numeric, 10),
    ('finish', 'pss',   'Polished Stainless Steel', NULL::numeric, 20),
    ('finish', 'black', 'Matte Black', NULL::numeric, 30),
    ('finish', 'gold',  'Brushed Gold', NULL::numeric, 40),

    ('handle_size', '600',  '600mm',  600, 10),
    ('handle_size', '800',  '800mm',  800, 20),
    ('handle_size', '1000', '1000mm', 1000, 30),

    ('lock_type', 'standard', 'Standard Glass Lock', NULL::numeric, 10),
    ('lock_type', 'deadlock', 'Dead Lock', NULL::numeric, 20)
) AS x(attribute_code, code, label, numeric_value, sort_order)
    ON x.attribute_code = ca.code
WHERE pf.code = 'GLASS_SWING_DOOR';

-- ============================================================
-- 12. 50 hardware SKUs
-- ============================================================
INSERT INTO product_sku
(sku, product_type, name, description, material, finish,
 min_glass_thickness, max_glass_thickness,
 max_door_width, max_door_height, max_door_weight,
 unit, price, inventory)
VALUES
-- Hinges: 12
('HINGE-G2G-90-SSS', 'hinge', '90 Degree Glass-to-Glass Hinge SSS', 'Standard hinge for 8-10mm glass', '304 Stainless Steel', 'SSS', 8, 10, 900, 2100, 40, 'pcs', 28.00, 500),
('HINGE-G2G-90-PSS', 'hinge', '90 Degree Glass-to-Glass Hinge PSS', 'Standard hinge for 8-10mm glass', '304 Stainless Steel', 'PSS', 8, 10, 900, 2100, 40, 'pcs', 30.00, 400),
('HINGE-G2G-90-BLK', 'hinge', '90 Degree Glass-to-Glass Hinge Black', 'Black standard hinge for 8-10mm glass', '304 Stainless Steel', 'Black', 8, 10, 900, 2100, 40, 'pcs', 32.00, 400),
('HINGE-G2G-90-GOLD', 'hinge', '90 Degree Glass-to-Glass Hinge Gold', 'Gold standard hinge for 8-10mm glass', '304 Stainless Steel', 'Gold', 8, 10, 900, 2100, 40, 'pcs', 35.00, 300),
('HINGE-G2G-180-SSS', 'hinge', '180 Degree Glass-to-Glass Hinge SSS', '180 degree hinge', '304 Stainless Steel', 'SSS', 8, 10, 900, 2100, 40, 'pcs', 31.00, 350),
('HINGE-G2G-180-BLK', 'hinge', '180 Degree Glass-to-Glass Hinge Black', '180 degree hinge', '304 Stainless Steel', 'Black', 8, 10, 900, 2100, 40, 'pcs', 35.00, 300),
('HINGE-G2W-90-SSS', 'hinge', '90 Degree Glass-to-Wall Hinge SSS', 'Wall mounting hinge', '304 Stainless Steel', 'SSS', 8, 12, 1000, 2200, 50, 'pcs', 34.00, 300),
('HINGE-G2W-90-BLK', 'hinge', '90 Degree Glass-to-Wall Hinge Black', 'Wall mounting hinge', '304 Stainless Steel', 'Black', 8, 12, 1000, 2200, 50, 'pcs', 38.00, 250),
('HINGE-HD-90-SSS', 'hinge', 'Heavy Duty 90 Degree Hinge SSS', 'Heavy duty hinge for large glass doors', '316 Stainless Steel', 'SSS', 10, 12, 1200, 2400, 65, 'pcs', 48.00, 250),
('HINGE-HD-90-BLK', 'hinge', 'Heavy Duty 90 Degree Hinge Black', 'Heavy duty hinge for large glass doors', '316 Stainless Steel', 'Black', 10, 12, 1200, 2400, 65, 'pcs', 54.00, 200),
('HINGE-HD-90-GOLD', 'hinge', 'Heavy Duty 90 Degree Hinge Gold', 'Heavy duty hinge for large glass doors', '316 Stainless Steel', 'Gold', 10, 12, 1200, 2400, 65, 'pcs', 58.00, 180),
('HINGE-HD-180-SSS', 'hinge', 'Heavy Duty 180 Degree Hinge SSS', 'Heavy duty 180 degree hinge', '316 Stainless Steel', 'SSS', 10, 12, 1200, 2400, 65, 'pcs', 52.00, 180),

-- Handles: 8
('HANDLE-600-SSS', 'handle', '600mm Pull Handle SSS', 'Back-to-back pull handle', '304 Stainless Steel', 'SSS', 8, 12, 1200, 2400, 80, 'set', 42.00, 500),
('HANDLE-600-PSS', 'handle', '600mm Pull Handle PSS', 'Back-to-back pull handle', '304 Stainless Steel', 'PSS', 8, 12, 1200, 2400, 80, 'set', 44.00, 450),
('HANDLE-600-BLK', 'handle', '600mm Pull Handle Black', 'Back-to-back pull handle', '304 Stainless Steel', 'Black', 8, 12, 1200, 2400, 80, 'set', 46.00, 400),
('HANDLE-600-GOLD', 'handle', '600mm Pull Handle Gold', 'Back-to-back pull handle', '304 Stainless Steel', 'Gold', 8, 12, 1200, 2400, 80, 'set', 49.00, 300),
('HANDLE-800-SSS', 'handle', '800mm Pull Handle SSS', 'Back-to-back pull handle', '304 Stainless Steel', 'SSS', 8, 12, 1200, 2400, 80, 'set', 52.00, 400),
('HANDLE-800-BLK', 'handle', '800mm Pull Handle Black', 'Back-to-back pull handle', '304 Stainless Steel', 'Black', 8, 12, 1200, 2400, 80, 'set', 56.00, 350),
('HANDLE-1000-SSS', 'handle', '1000mm Pull Handle SSS', 'Back-to-back pull handle', '304 Stainless Steel', 'SSS', 8, 12, 1400, 2600, 100, 'set', 65.00, 250),
('HANDLE-1000-BLK', 'handle', '1000mm Pull Handle Black', 'Back-to-back pull handle', '304 Stainless Steel', 'Black', 8, 12, 1400, 2600, 100, 'set', 70.00, 220),

-- Locks: 8
('LOCK-GLASS-SSS', 'lock', 'Standard Glass Door Lock SSS', 'Patch lock for frameless door', '304 Stainless Steel', 'SSS', 8, 12, 1200, 2400, 80, 'pcs', 38.00, 400),
('LOCK-GLASS-BLK', 'lock', 'Standard Glass Door Lock Black', 'Patch lock for frameless door', '304 Stainless Steel', 'Black', 8, 12, 1200, 2400, 80, 'pcs', 42.00, 350),
('LOCK-GLASS-GOLD', 'lock', 'Standard Glass Door Lock Gold', 'Patch lock for frameless door', '304 Stainless Steel', 'Gold', 8, 12, 1200, 2400, 80, 'pcs', 45.00, 250),
('LOCK-DEAD-SSS', 'lock', 'Dead Lock SSS', 'Heavy duty dead lock', '304 Stainless Steel', 'SSS', 10, 12, 1400, 2600, 100, 'pcs', 55.00, 250),
('LOCK-DEAD-BLK', 'lock', 'Dead Lock Black', 'Heavy duty dead lock', '304 Stainless Steel', 'Black', 10, 12, 1400, 2600, 100, 'pcs', 60.00, 200),
('LOCK-DEAD-GOLD', 'lock', 'Dead Lock Gold', 'Heavy duty dead lock', '304 Stainless Steel', 'Gold', 10, 12, 1400, 2600, 100, 'pcs', 64.00, 180),
('LOCK-PRIVACY-SSS', 'lock', 'Privacy Lock SSS', 'Interior privacy lock', '304 Stainless Steel', 'SSS', 8, 10, 1000, 2200, 60, 'pcs', 40.00, 250),
('LOCK-PRIVACY-BLK', 'lock', 'Privacy Lock Black', 'Interior privacy lock', '304 Stainless Steel', 'Black', 8, 10, 1000, 2200, 60, 'pcs', 44.00, 220),

-- Floor springs: 6
('FLOORSPRING-80KG', 'floor_spring', 'Floor Spring 80kg', 'Standard floor spring', 'Alloy Steel', 'SSS', 8, 12, 1000, 2200, 80, 'pcs', 95.00, 150),
('FLOORSPRING-120KG', 'floor_spring', 'Floor Spring 120kg', 'Medium duty floor spring', 'Alloy Steel', 'SSS', 8, 12, 1200, 2400, 120, 'pcs', 125.00, 120),
('FLOORSPRING-150KG', 'floor_spring', 'Floor Spring 150kg', 'Heavy duty floor spring', 'Alloy Steel', 'SSS', 10, 12, 1400, 2600, 150, 'pcs', 160.00, 80),
('FLOORSPRING-120KG-BLK', 'floor_spring', 'Floor Spring 120kg Black', 'Black cover floor spring', 'Alloy Steel', 'Black', 8, 12, 1200, 2400, 120, 'pcs', 135.00, 100),
('FLOORSPRING-150KG-BLK', 'floor_spring', 'Floor Spring 150kg Black', 'Black heavy duty floor spring', 'Alloy Steel', 'Black', 10, 12, 1400, 2600, 150, 'pcs', 172.00, 70),
('FLOORSPRING-80KG-BLK', 'floor_spring', 'Floor Spring 80kg Black', 'Black standard floor spring', 'Alloy Steel', 'Black', 8, 12, 1000, 2200, 80, 'pcs', 105.00, 100),

-- Door closers: 4
('CLOSER-SURFACE-60-SSS', 'door_closer', 'Surface Door Closer 60kg SSS', 'Surface mounted closer', 'Aluminum Alloy', 'SSS', 8, 10, 900, 2100, 60, 'pcs', 55.00, 180),
('CLOSER-SURFACE-80-BLK', 'door_closer', 'Surface Door Closer 80kg Black', 'Surface mounted closer', 'Aluminum Alloy', 'Black', 8, 12, 1000, 2200, 80, 'pcs', 65.00, 150),
('CLOSER-CONCEALED-80-SSS', 'door_closer', 'Concealed Door Closer 80kg SSS', 'Concealed closer', 'Steel', 'SSS', 8, 12, 1000, 2200, 80, 'pcs', 78.00, 120),
('CLOSER-CONCEALED-120-BLK', 'door_closer', 'Concealed Door Closer 120kg Black', 'Heavy duty concealed closer', 'Steel', 'Black', 10, 12, 1200, 2400, 120, 'pcs', 98.00, 90),

-- Glass clamps: 4
('CLAMP-GLASS-SSS', 'glass_clamp', 'Glass Clamp SSS', 'Standard glass clamp', '304 Stainless Steel', 'SSS', 8, 12, 1200, 2400, 80, 'pcs', 9.00, 800),
('CLAMP-GLASS-BLK', 'glass_clamp', 'Glass Clamp Black', 'Standard glass clamp', '304 Stainless Steel', 'Black', 8, 12, 1200, 2400, 80, 'pcs', 10.00, 700),
('CLAMP-HEAVY-SSS', 'glass_clamp', 'Heavy Duty Glass Clamp SSS', 'Heavy duty clamp', '316 Stainless Steel', 'SSS', 10, 12, 1400, 2600, 120, 'pcs', 14.00, 500),
('CLAMP-HEAVY-BLK', 'glass_clamp', 'Heavy Duty Glass Clamp Black', 'Heavy duty clamp', '316 Stainless Steel', 'Black', 10, 12, 1400, 2600, 120, 'pcs', 16.00, 450),

-- Seals: 4
('SEAL-PVC-8MM', 'seal', 'PVC Glass Seal 8mm', 'PVC edge seal', 'PVC', 'Clear', 8, 8, 1200, 2400, 100, 'm', 3.50, 2000),
('SEAL-PVC-10MM', 'seal', 'PVC Glass Seal 10mm', 'PVC edge seal', 'PVC', 'Clear', 10, 10, 1200, 2400, 100, 'm', 3.80, 2000),
('SEAL-PVC-12MM', 'seal', 'PVC Glass Seal 12mm', 'PVC edge seal', 'PVC', 'Clear', 12, 12, 1400, 2600, 120, 'm', 4.20, 1800),
('SEAL-BOTTOM-UNIVERSAL', 'seal', 'Universal Bottom Door Seal', 'Bottom seal for swing door', 'PVC + Aluminum', 'Clear', 8, 12, 1400, 2600, 120, 'm', 8.50, 1200);

-- Extra accessory SKUs: 47-50
INSERT INTO product_sku
(sku, product_type, name, description, material, finish, min_glass_thickness, max_glass_thickness, max_door_width, max_door_height, max_door_weight, unit, price, inventory)
VALUES
('PULL-ROSETTE-SSS', 'accessory', 'Pull Handle Rosette SSS', 'Matching rosette set for pull handles', '304 Stainless Steel', 'SSS', 8, 12, 1400, 2600, 120, 'set', 12.00, 500),
('PULL-ROSETTE-BLK', 'accessory', 'Pull Handle Rosette Black', 'Matching black rosette set', '304 Stainless Steel', 'Black', 8, 12, 1400, 2600, 120, 'set', 14.00, 450),
('DOOR-STOP-SSS', 'accessory', 'Glass Door Floor Stop SSS', 'Floor mounted door stop', '304 Stainless Steel', 'SSS', 8, 12, 1400, 2600, 120, 'pcs', 8.00, 600),
('DOOR-STOP-BLK', 'accessory', 'Glass Door Floor Stop Black', 'Black floor mounted door stop', '304 Stainless Steel', 'Black', 8, 12, 1400, 2600, 120, 'pcs', 9.00, 500);

-- ============================================================
-- 13. 25 recommendation rules
-- ============================================================
INSERT INTO recommendation_rule
(family_id, code, name, priority, description)
SELECT pf.id, x.code, x.name, x.priority, x.description
FROM product_family pf
CROSS JOIN (
    VALUES
    ('SWING-SINGLE-8-STD',   'Single 8mm Standard Glass-to-Glass', 100, 'Single door, 8mm, standard size'),
    ('SWING-SINGLE-10-STD',  'Single 10mm Standard Glass-to-Glass', 110, 'Single door, 10mm, standard size'),
    ('SWING-SINGLE-12-HD',   'Single 12mm Heavy Duty Glass-to-Glass', 120, 'Single door, 12mm, heavy duty'),
    ('SWING-SINGLE-8-WALL',  'Single 8mm Glass-to-Wall', 130, 'Single door, wall mounting'),
    ('SWING-SINGLE-10-WALL', 'Single 10mm Glass-to-Wall', 140, 'Single door, wall mounting'),
    ('SWING-SINGLE-12-WALL', 'Single 12mm Glass-to-Wall Heavy Duty', 150, 'Single door, wall mounting'),
    ('SWING-DOUBLE-8-STD',   'Double 8mm Standard', 200, 'Double swing, 8mm'),
    ('SWING-DOUBLE-10-STD',  'Double 10mm Standard', 210, 'Double swing, 10mm'),
    ('SWING-DOUBLE-12-HD',   'Double 12mm Heavy Duty', 220, 'Double swing, 12mm'),
    ('SWING-SINGLE-SMALL-8', 'Single 8mm Small Door', 300, 'Small 8mm door'),
    ('SWING-SINGLE-SMALL-10','Single 10mm Small Door', 310, 'Small 10mm door'),
    ('SWING-SINGLE-LARGE-10','Single 10mm Large Door', 320, 'Large 10mm door'),
    ('SWING-SINGLE-LARGE-12','Single 12mm Large Door', 330, 'Large 12mm door'),
    ('SWING-SINGLE-BLACK-8', 'Single 8mm Black Finish', 400, 'Black finish 8mm'),
    ('SWING-SINGLE-BLACK-10','Single 10mm Black Finish', 410, 'Black finish 10mm'),
    ('SWING-SINGLE-BLACK-12','Single 12mm Black Finish', 420, 'Black finish 12mm'),
    ('SWING-SINGLE-GOLD-8',  'Single 8mm Gold Finish', 430, 'Gold finish 8mm'),
    ('SWING-SINGLE-GOLD-10', 'Single 10mm Gold Finish', 440, 'Gold finish 10mm'),
    ('SWING-SINGLE-GOLD-12', 'Single 12mm Gold Finish', 450, 'Gold finish 12mm'),
    ('SWING-SINGLE-LEFT',    'Single Left Hand Opening', -10, 'Left hand opening'),
    ('SWING-SINGLE-RIGHT',   'Single Right Hand Opening', -11, 'Right hand opening'),
    ('SWING-SINGLE-HANDLE-800','Single 800mm Handle Package', -20, '800mm handle'),
    ('SWING-SINGLE-HANDLE-1000','Single 1000mm Handle Package', -21, '1000mm handle'),
    ('SWING-SINGLE-DEADLOCK','Single Dead Lock Package', -30, 'Dead lock'),
    ('SWING-SINGLE-PRIVACY','Single Privacy Lock Package', -31, 'Privacy lock')
) AS x(code, name, priority, description)
WHERE pf.code = 'GLASS_SWING_DOOR';

-- Conditions: helper function not needed; direct rule-id lookup.
-- Base rules.
INSERT INTO recommendation_rule_condition (rule_id, attribute_code, operator, value)
SELECT r.id, x.attribute_code, x.operator, x.value
FROM recommendation_rule r
JOIN (
    VALUES
    ('SWING-SINGLE-8-STD',   'door_type','eq','single'),
    ('SWING-SINGLE-8-STD',   'glass_thickness','eq','8'),
    ('SWING-SINGLE-8-STD',   'mounting_type','eq','glass_to_glass'),

    ('SWING-SINGLE-10-STD',  'door_type','eq','single'),
    ('SWING-SINGLE-10-STD',  'glass_thickness','eq','10'),
    ('SWING-SINGLE-10-STD',  'mounting_type','eq','glass_to_glass'),

    ('SWING-SINGLE-12-HD',   'door_type','eq','single'),
    ('SWING-SINGLE-12-HD',   'glass_thickness','eq','12'),
    ('SWING-SINGLE-12-HD',   'mounting_type','eq','glass_to_glass'),

    ('SWING-SINGLE-8-WALL',  'door_type','eq','single'),
    ('SWING-SINGLE-8-WALL',  'glass_thickness','eq','8'),
    ('SWING-SINGLE-8-WALL',  'mounting_type','eq','glass_to_wall'),

    ('SWING-SINGLE-10-WALL', 'door_type','eq','single'),
    ('SWING-SINGLE-10-WALL', 'glass_thickness','eq','10'),
    ('SWING-SINGLE-10-WALL', 'mounting_type','eq','glass_to_wall'),

    ('SWING-SINGLE-12-WALL', 'door_type','eq','single'),
    ('SWING-SINGLE-12-WALL', 'glass_thickness','eq','12'),
    ('SWING-SINGLE-12-WALL', 'mounting_type','eq','glass_to_wall'),

    ('SWING-DOUBLE-8-STD',   'door_type','eq','double'),
    ('SWING-DOUBLE-8-STD',   'glass_thickness','eq','8'),

    ('SWING-DOUBLE-10-STD',  'door_type','eq','double'),
    ('SWING-DOUBLE-10-STD',  'glass_thickness','eq','10'),

    ('SWING-DOUBLE-12-HD',   'door_type','eq','double'),
    ('SWING-DOUBLE-12-HD',   'glass_thickness','eq','12'),

    ('SWING-SINGLE-SMALL-8', 'door_type','eq','single'),
    ('SWING-SINGLE-SMALL-8', 'glass_thickness','eq','8'),
    ('SWING-SINGLE-SMALL-8', 'door_width','lte','800'),
    ('SWING-SINGLE-SMALL-8', 'door_height','lte','2000'),

    ('SWING-SINGLE-SMALL-10','door_type','eq','single'),
    ('SWING-SINGLE-SMALL-10','glass_thickness','eq','10'),
    ('SWING-SINGLE-SMALL-10','door_width','lte','800'),
    ('SWING-SINGLE-SMALL-10','door_height','lte','2000'),

    ('SWING-SINGLE-LARGE-10','door_type','eq','single'),
    ('SWING-SINGLE-LARGE-10','glass_thickness','eq','10'),
    ('SWING-SINGLE-LARGE-10','mounting_type','eq','glass_to_glass'),
    ('SWING-SINGLE-LARGE-10','door_width','gte','1001'),

    ('SWING-SINGLE-LARGE-12','door_type','eq','single'),
    ('SWING-SINGLE-LARGE-12','glass_thickness','eq','12'),
    ('SWING-SINGLE-LARGE-12','mounting_type','eq','glass_to_glass'),
    ('SWING-SINGLE-LARGE-12','door_width','gte','1001'),

    ('SWING-SINGLE-BLACK-8','door_type','eq','single'),
    ('SWING-SINGLE-BLACK-8','glass_thickness','eq','8'),
    ('SWING-SINGLE-BLACK-8','finish','eq','black'),
    ('SWING-SINGLE-BLACK-8','mounting_type','eq','glass_to_glass'),

    ('SWING-SINGLE-BLACK-10','door_type','eq','single'),
    ('SWING-SINGLE-BLACK-10','glass_thickness','eq','10'),
    ('SWING-SINGLE-BLACK-10','finish','eq','black'),
    ('SWING-SINGLE-BLACK-10','mounting_type','eq','glass_to_glass'),

    ('SWING-SINGLE-BLACK-12','door_type','eq','single'),
    ('SWING-SINGLE-BLACK-12','glass_thickness','eq','12'),
    ('SWING-SINGLE-BLACK-12','finish','eq','black'),
    ('SWING-SINGLE-BLACK-12','mounting_type','eq','glass_to_glass'),

    ('SWING-SINGLE-GOLD-8','door_type','eq','single'),
    ('SWING-SINGLE-GOLD-8','glass_thickness','eq','8'),
    ('SWING-SINGLE-GOLD-8','finish','eq','gold'),
    ('SWING-SINGLE-GOLD-8','mounting_type','eq','glass_to_glass'),

    ('SWING-SINGLE-GOLD-10','door_type','eq','single'),
    ('SWING-SINGLE-GOLD-10','glass_thickness','eq','10'),
    ('SWING-SINGLE-GOLD-10','finish','eq','gold'),
    ('SWING-SINGLE-GOLD-10','mounting_type','eq','glass_to_glass'),

    ('SWING-SINGLE-GOLD-12','door_type','eq','single'),
    ('SWING-SINGLE-GOLD-12','glass_thickness','eq','12'),
    ('SWING-SINGLE-GOLD-12','finish','eq','gold'),
    ('SWING-SINGLE-GOLD-12','mounting_type','eq','glass_to_glass'),

    ('SWING-SINGLE-LEFT','door_type','eq','single'),
    ('SWING-SINGLE-LEFT','opening_type','eq','left'),

    ('SWING-SINGLE-RIGHT','door_type','eq','single'),
    ('SWING-SINGLE-RIGHT','opening_type','eq','right'),

    ('SWING-SINGLE-HANDLE-800','door_type','eq','single'),
    ('SWING-SINGLE-HANDLE-800','handle_size','eq','800'),

    ('SWING-SINGLE-HANDLE-1000','door_type','eq','single'),
    ('SWING-SINGLE-HANDLE-1000','handle_size','eq','1000'),

    ('SWING-SINGLE-DEADLOCK','door_type','eq','single'),
    ('SWING-SINGLE-DEADLOCK','lock_type','eq','deadlock'),

    ('SWING-SINGLE-PRIVACY','door_type','eq','single'),
    ('SWING-SINGLE-PRIVACY','lock_type','eq','standard')
) AS x(code, attribute_code, operator, value)
ON x.code = r.code;

-- ============================================================
-- 14. Rule items
-- ============================================================
-- Standard 8mm G2G
INSERT INTO recommendation_rule_item (rule_id, sku, quantity, required, sort_order)
SELECT r.id, x.sku, x.qty, x.required, x.sort_order
FROM recommendation_rule r
JOIN (
    VALUES
    ('SWING-SINGLE-8-STD','HINGE-G2G-90-SSS',2,true,10),
    ('SWING-SINGLE-8-STD','HANDLE-600-SSS',1,true,20),
    ('SWING-SINGLE-8-STD','LOCK-GLASS-SSS',1,true,30),
    ('SWING-SINGLE-8-STD','SEAL-PVC-8MM',1,false,40),
    ('SWING-SINGLE-8-STD','SEAL-BOTTOM-UNIVERSAL',1,false,50),

    ('SWING-SINGLE-10-STD','HINGE-G2G-90-SSS',2,true,10),
    ('SWING-SINGLE-10-STD','HANDLE-600-SSS',1,true,20),
    ('SWING-SINGLE-10-STD','LOCK-GLASS-SSS',1,true,30),
    ('SWING-SINGLE-10-STD','SEAL-PVC-10MM',1,false,40),
    ('SWING-SINGLE-10-STD','SEAL-BOTTOM-UNIVERSAL',1,false,50),

    ('SWING-SINGLE-12-HD','HINGE-HD-90-SSS',2,true,10),
    ('SWING-SINGLE-12-HD','HANDLE-800-SSS',1,true,20),
    ('SWING-SINGLE-12-HD','LOCK-DEAD-SSS',1,true,30),
    ('SWING-SINGLE-12-HD','FLOORSPRING-120KG',1,false,40),
    ('SWING-SINGLE-12-HD','SEAL-PVC-12MM',1,false,50),
    ('SWING-SINGLE-12-HD','SEAL-BOTTOM-UNIVERSAL',1,false,60),

    ('SWING-SINGLE-8-WALL','HINGE-G2W-90-SSS',2,true,10),
    ('SWING-SINGLE-8-WALL','HANDLE-600-SSS',1,true,20),
    ('SWING-SINGLE-8-WALL','LOCK-GLASS-SSS',1,true,30),
    ('SWING-SINGLE-8-WALL','SEAL-PVC-8MM',1,false,40),

    ('SWING-SINGLE-10-WALL','HINGE-G2W-90-SSS',2,true,10),
    ('SWING-SINGLE-10-WALL','HANDLE-600-SSS',1,true,20),
    ('SWING-SINGLE-10-WALL','LOCK-GLASS-SSS',1,true,30),
    ('SWING-SINGLE-10-WALL','SEAL-PVC-10MM',1,false,40),

    ('SWING-SINGLE-12-WALL','HINGE-G2W-90-SSS',2,true,10),
    ('SWING-SINGLE-12-WALL','HANDLE-800-SSS',1,true,20),
    ('SWING-SINGLE-12-WALL','LOCK-DEAD-SSS',1,true,30),
    ('SWING-SINGLE-12-WALL','SEAL-PVC-12MM',1,false,40),

    ('SWING-DOUBLE-8-STD','HINGE-G2G-180-SSS',4,true,10),
    ('SWING-DOUBLE-8-STD','HANDLE-600-SSS',2,true,20),
    ('SWING-DOUBLE-8-STD','LOCK-GLASS-SSS',2,true,30),
    ('SWING-DOUBLE-8-STD','SEAL-PVC-8MM',2,false,40),

    ('SWING-DOUBLE-10-STD','HINGE-G2G-180-SSS',4,true,10),
    ('SWING-DOUBLE-10-STD','HANDLE-800-SSS',2,true,20),
    ('SWING-DOUBLE-10-STD','LOCK-GLASS-SSS',2,true,30),
    ('SWING-DOUBLE-10-STD','SEAL-PVC-10MM',2,false,40),

    ('SWING-DOUBLE-12-HD','HINGE-HD-180-SSS',4,true,10),
    ('SWING-DOUBLE-12-HD','HANDLE-1000-SSS',2,true,20),
    ('SWING-DOUBLE-12-HD','LOCK-DEAD-SSS',2,true,30),
    ('SWING-DOUBLE-12-HD','FLOORSPRING-150KG',2,false,40),
    ('SWING-DOUBLE-12-HD','SEAL-PVC-12MM',2,false,50),

    ('SWING-SINGLE-SMALL-8','HINGE-G2G-90-SSS',2,true,10),
    ('SWING-SINGLE-SMALL-8','HANDLE-600-SSS',1,true,20),
    ('SWING-SINGLE-SMALL-8','LOCK-PRIVACY-SSS',1,true,30),

    ('SWING-SINGLE-SMALL-10','HINGE-G2G-90-SSS',2,true,10),
    ('SWING-SINGLE-SMALL-10','HANDLE-600-SSS',1,true,20),
    ('SWING-SINGLE-SMALL-10','LOCK-PRIVACY-SSS',1,true,30),

    ('SWING-SINGLE-LARGE-10','HINGE-HD-90-SSS',2,true,10),
    ('SWING-SINGLE-LARGE-10','HANDLE-1000-SSS',1,true,20),
    ('SWING-SINGLE-LARGE-10','LOCK-DEAD-SSS',1,true,30),
    ('SWING-SINGLE-LARGE-10','FLOORSPRING-120KG',1,false,40),

    ('SWING-SINGLE-LARGE-12','HINGE-HD-90-SSS',2,true,10),
    ('SWING-SINGLE-LARGE-12','HANDLE-1000-SSS',1,true,20),
    ('SWING-SINGLE-LARGE-12','LOCK-DEAD-SSS',1,true,30),
    ('SWING-SINGLE-LARGE-12','FLOORSPRING-150KG',1,false,40),

    ('SWING-SINGLE-BLACK-8','HINGE-G2G-90-BLK',2,true,10),
    ('SWING-SINGLE-BLACK-8','HANDLE-600-BLK',1,true,20),
    ('SWING-SINGLE-BLACK-8','LOCK-GLASS-BLK',1,true,30),
    ('SWING-SINGLE-BLACK-8','SEAL-PVC-8MM',1,false,40),

    ('SWING-SINGLE-BLACK-10','HINGE-G2G-90-BLK',2,true,10),
    ('SWING-SINGLE-BLACK-10','HANDLE-600-BLK',1,true,20),
    ('SWING-SINGLE-BLACK-10','LOCK-GLASS-BLK',1,true,30),
    ('SWING-SINGLE-BLACK-10','SEAL-PVC-10MM',1,false,40),

    ('SWING-SINGLE-BLACK-12','HINGE-HD-90-BLK',2,true,10),
    ('SWING-SINGLE-BLACK-12','HANDLE-800-BLK',1,true,20),
    ('SWING-SINGLE-BLACK-12','LOCK-DEAD-BLK',1,true,30),
    ('SWING-SINGLE-BLACK-12','SEAL-PVC-12MM',1,false,40),

    ('SWING-SINGLE-GOLD-8','HINGE-G2G-90-GOLD',2,true,10),
    ('SWING-SINGLE-GOLD-8','HANDLE-600-GOLD',1,true,20),
    ('SWING-SINGLE-GOLD-8','LOCK-GLASS-GOLD',1,true,30),

    ('SWING-SINGLE-GOLD-10','HINGE-G2G-90-GOLD',2,true,10),
    ('SWING-SINGLE-GOLD-10','HANDLE-600-GOLD',1,true,20),
    ('SWING-SINGLE-GOLD-10','LOCK-GLASS-GOLD',1,true,30),

    ('SWING-SINGLE-GOLD-12','HINGE-HD-90-GOLD',2,true,10),
    ('SWING-SINGLE-GOLD-12','HANDLE-800-BLK',1,true,20),
    ('SWING-SINGLE-GOLD-12','LOCK-DEAD-GOLD',1,true,30),

    ('SWING-SINGLE-LEFT','HINGE-G2G-90-SSS',2,true,10),
    ('SWING-SINGLE-LEFT','HANDLE-600-SSS',1,true,20),

    ('SWING-SINGLE-RIGHT','HINGE-G2G-90-SSS',2,true,10),
    ('SWING-SINGLE-RIGHT','HANDLE-600-SSS',1,true,20),

    ('SWING-SINGLE-HANDLE-800','HANDLE-800-SSS',1,true,10),
    ('SWING-SINGLE-HANDLE-1000','HANDLE-1000-SSS',1,true,10),

    ('SWING-SINGLE-DEADLOCK','LOCK-DEAD-SSS',1,true,10),
    ('SWING-SINGLE-PRIVACY','LOCK-PRIVACY-SSS',1,true,10)
) AS x(rule_code, sku, qty, required, sort_order)
ON x.rule_code = r.code;

-- Quantity rules for hinges.
-- For demo purposes, door weight is calculated as area * 25kg/m2 for 10mm,
-- with approximate factors used by the application layer.
INSERT INTO recommendation_quantity_rule
(rule_item_id, min_door_weight, max_door_weight, quantity, priority)
SELECT ri.id, x.min_w, x.max_w, x.qty, x.priority
FROM recommendation_rule_item ri
JOIN (
    VALUES
    ('SWING-SINGLE-8-STD','HINGE-G2G-90-SSS',0,40,2,10),
    ('SWING-SINGLE-10-STD','HINGE-G2G-90-SSS',0,40,2,10),
    ('SWING-SINGLE-10-STD','HINGE-G2G-90-SSS',40.01,60,3,20),
    ('SWING-SINGLE-12-HD','HINGE-HD-90-SSS',0,65,2,10),
    ('SWING-SINGLE-8-WALL','HINGE-G2W-90-SSS',0,50,2,10),
    ('SWING-SINGLE-10-WALL','HINGE-G2W-90-SSS',0,50,2,10),
    ('SWING-SINGLE-12-WALL','HINGE-G2W-90-SSS',0,50,2,10),
    ('SWING-SINGLE-12-WALL','HINGE-G2W-90-SSS',50.01,65,3,20),
    ('SWING-DOUBLE-8-STD','HINGE-G2G-180-SSS',0,40,4,10),
    ('SWING-DOUBLE-10-STD','HINGE-G2G-180-SSS',0,40,4,10),
    ('SWING-DOUBLE-10-STD','HINGE-G2G-180-SSS',40.01,60,6,20),
    ('SWING-DOUBLE-12-HD','HINGE-HD-180-SSS',0,65,4,10),
    ('SWING-SINGLE-SMALL-8','HINGE-G2G-90-SSS',0,40,2,10),
    ('SWING-SINGLE-SMALL-10','HINGE-G2G-90-SSS',0,40,2,10),
    ('SWING-SINGLE-LARGE-10','HINGE-HD-90-SSS',0,65,2,10),
    ('SWING-SINGLE-LARGE-12','HINGE-HD-90-SSS',0,65,2,10),
    ('SWING-SINGLE-BLACK-8','HINGE-G2G-90-BLK',0,40,2,10),
    ('SWING-SINGLE-BLACK-10','HINGE-G2G-90-BLK',0,40,2,10),
    ('SWING-SINGLE-BLACK-10','HINGE-G2G-90-BLK',40.01,60,3,20),
    ('SWING-SINGLE-BLACK-12','HINGE-HD-90-BLK',0,65,2,10),
    ('SWING-SINGLE-GOLD-8','HINGE-G2G-90-GOLD',0,40,2,10),
    ('SWING-SINGLE-GOLD-10','HINGE-G2G-90-GOLD',0,40,2,10),
    ('SWING-SINGLE-GOLD-12','HINGE-HD-90-GOLD',0,65,2,10)
) AS x(rule_code, sku, min_w, max_w, qty, priority)
ON ri.rule_id = (SELECT id FROM recommendation_rule WHERE code = x.rule_code)
AND ri.sku = x.sku;

-- ============================================================
-- 15. Compatibility examples
-- ============================================================
INSERT INTO sku_compatibility (sku, compatible_sku, relation, note)
VALUES
('HINGE-G2G-90-SSS', 'LOCK-GLASS-SSS', 'compatible', 'Standard 8-10mm swing door package'),
('HINGE-G2G-90-BLK', 'LOCK-GLASS-BLK', 'compatible', 'Matching black finish'),
('HINGE-HD-90-SSS', 'LOCK-DEAD-SSS', 'compatible', 'Heavy duty 10-12mm package'),
('HINGE-HD-90-BLK', 'LOCK-DEAD-BLK', 'compatible', 'Heavy duty black package'),
('HANDLE-600-SSS', 'LOCK-GLASS-SSS', 'compatible', 'Standard handle + lock'),
('HANDLE-800-SSS', 'LOCK-DEAD-SSS', 'compatible', 'Heavy door package'),
('HANDLE-1000-SSS', 'LOCK-DEAD-SSS', 'compatible', 'Large door package'),
('HINGE-G2G-90-SSS', 'HINGE-HD-90-SSS', 'alternative', 'Do not use both; choose by door load'),
('FLOORSPRING-80KG', 'FLOORSPRING-120KG', 'alternative', 'Choose capacity based on door weight'),
('LOCK-GLASS-SSS', 'LOCK-DEAD-SSS', 'alternative', 'Choose lock based on door size/use case');

-- ============================================================
-- 16. Reusable BOM templates
-- ============================================================
INSERT INTO bom (family_id, code, name, version)
SELECT id, 'BOM-SWING-SINGLE-10-STD', 'Glass Swing Door Single 10mm Standard BOM', '1.0'
FROM product_family WHERE code = 'GLASS_SWING_DOOR';

INSERT INTO bom_item (bom_id, sku, quantity, required, note)
SELECT b.id, x.sku, x.qty, x.required, x.note
FROM bom b
JOIN (
    VALUES
    ('HINGE-G2G-90-SSS',2,true,'Quantity may change based on door weight'),
    ('HANDLE-600-SSS',1,true,'Standard handle'),
    ('LOCK-GLASS-SSS',1,true,'Standard lock'),
    ('SEAL-PVC-10MM',1,false,'Length calculated by application'),
    ('SEAL-BOTTOM-UNIVERSAL',1,false,'Length normally equals door width')
) AS x(sku, qty, required, note)
ON true
WHERE b.code = 'BOM-SWING-SINGLE-10-STD';

-- ============================================================
-- 17. Test configurations
-- ============================================================
INSERT INTO test_configuration (family_id, name, config)
SELECT pf.id, x.name, x.config::jsonb
FROM product_family pf
CROSS JOIN (
    VALUES
    ('Test A - Single 10mm 900x2100 SSS',
     '{"door_type":"single","glass_thickness":"10","door_width":900,"door_height":2100,"mounting_type":"glass_to_glass","opening_type":"left","finish":"sss","handle_size":"600","lock_type":"standard"}'),

    ('Test B - Single 10mm 1100x2200 Black',
     '{"door_type":"single","glass_thickness":"10","door_width":1100,"door_height":2200,"mounting_type":"glass_to_glass","opening_type":"right","finish":"black","handle_size":"800","lock_type":"deadlock"}'),

    ('Test C - Single 12mm 1200x2400 Heavy',
     '{"door_type":"single","glass_thickness":"12","door_width":1200,"door_height":2400,"mounting_type":"glass_to_glass","opening_type":"right","finish":"sss","handle_size":"1000","lock_type":"deadlock"}'),

    ('Test D - Double 10mm 900x2100',
     '{"door_type":"double","glass_thickness":"10","door_width":900,"door_height":2100,"mounting_type":"glass_to_glass","opening_type":"double","finish":"sss","handle_size":"800","lock_type":"standard"}'),

    ('Test E - Single 10mm Wall Mount Black',
     '{"door_type":"single","glass_thickness":"10","door_width":900,"door_height":2100,"mounting_type":"glass_to_wall","opening_type":"left","finish":"black","handle_size":"600","lock_type":"standard"}')
) AS x(name, config)
WHERE pf.code = 'GLASS_SWING_DOOR';

COMMIT;

-- ============================================================
-- QUERY 1: See the whole product/rule tree
-- ============================================================
SELECT
    pf.name AS family,
    r.code AS rule_code,
    r.name AS rule_name,
    ri.sku,
    p.name AS sku_name,
    ri.quantity,
    ri.required
FROM product_family pf
JOIN recommendation_rule r
    ON r.family_id = pf.id
JOIN recommendation_rule_item ri
    ON ri.rule_id = r.id
JOIN product_sku p
    ON p.sku = ri.sku
WHERE pf.code = 'GLASS_SWING_DOOR'
ORDER BY r.priority, ri.sort_order;

-- ============================================================
-- QUERY 2: Simple direct lookup of a rule's BOM
-- ============================================================
SELECT
    r.name AS rule_name,
    p.sku,
    p.name,
    p.product_type,
    ri.quantity,
    ri.required,
    p.price,
    ri.quantity * p.price AS line_price
FROM recommendation_rule r
JOIN recommendation_rule_item ri ON ri.rule_id = r.id
JOIN product_sku p ON p.sku = ri.sku
WHERE r.code = 'SWING-SINGLE-10-STD'
ORDER BY ri.sort_order;

-- ============================================================
-- QUERY 3: Match rules from user input
--
-- This is the key query for the configurator.
-- Change the JSON below to test other configurations.
--
-- Rule semantics:
-- A rule matches only when NONE of its conditions fail.
-- Numeric conditions are evaluated as numbers.
-- ============================================================
WITH input AS (
    SELECT '{
        "door_type":"single",
        "glass_thickness":"10",
        "door_width":900,
        "door_height":2100,
        "mounting_type":"glass_to_glass",
        "opening_type":"left",
        "finish":"sss",
        "handle_size":"600",
        "lock_type":"standard"
    }'::jsonb AS cfg
),
matched_rules AS (
    SELECT
        r.id,
        r.code,
        r.name,
        r.priority
    FROM recommendation_rule r
    CROSS JOIN input i
    WHERE r.enabled = true
      AND r.family_id = (
          SELECT id FROM product_family WHERE code = 'GLASS_SWING_DOOR'
      )
      AND NOT EXISTS (
          SELECT 1
          FROM recommendation_rule_condition c
          WHERE c.rule_id = r.id
            AND NOT (
                CASE c.operator
                    WHEN 'eq' THEN
                        COALESCE(i.cfg ->> c.attribute_code, '') = c.value
                    WHEN 'neq' THEN
                        COALESCE(i.cfg ->> c.attribute_code, '') <> c.value
                    WHEN 'gte' THEN
                        COALESCE((i.cfg ->> c.attribute_code)::numeric, -1e18) >= c.value::numeric
                    WHEN 'lte' THEN
                        COALESCE((i.cfg ->> c.attribute_code)::numeric,  1e18) <= c.value::numeric
                    ELSE false
                END
            )
      )
)
SELECT *
FROM matched_rules
ORDER BY priority DESC;

-- ============================================================
-- QUERY 4: Get recommended hardware for the best matching rule
-- ============================================================
WITH input AS (
    SELECT '{
        "door_type":"single",
        "glass_thickness":"10",
        "door_width":900,
        "door_height":2100,
        "mounting_type":"glass_to_glass",
        "opening_type":"left",
        "finish":"sss",
        "handle_size":"600",
        "lock_type":"standard"
    }'::jsonb AS cfg
),
matched_rules AS (
    SELECT r.*
    FROM recommendation_rule r
    CROSS JOIN input i
    WHERE r.enabled
      AND r.family_id = (SELECT id FROM product_family WHERE code='GLASS_SWING_DOOR')
      AND NOT EXISTS (
          SELECT 1
          FROM recommendation_rule_condition c
          WHERE c.rule_id = r.id
            AND NOT (
                CASE c.operator
                    WHEN 'eq' THEN COALESCE(i.cfg ->> c.attribute_code, '') = c.value
                    WHEN 'neq' THEN COALESCE(i.cfg ->> c.attribute_code, '') <> c.value
                    WHEN 'gte' THEN COALESCE((i.cfg ->> c.attribute_code)::numeric, -1e18) >= c.value::numeric
                    WHEN 'lte' THEN COALESCE((i.cfg ->> c.attribute_code)::numeric,  1e18) <= c.value::numeric
                    ELSE false
                END
            )
      )
),
best_rule AS (
    SELECT *
    FROM matched_rules
    ORDER BY priority DESC
    LIMIT 1
)
SELECT
    br.code AS rule_code,
    br.name AS rule_name,
    p.sku,
    p.name AS product_name,
    p.product_type,
    ri.quantity,
    ri.required,
    p.unit,
    p.price,
    ri.quantity * p.price AS line_price
FROM best_rule br
JOIN recommendation_rule_item ri ON ri.rule_id = br.id
JOIN product_sku p ON p.sku = ri.sku
ORDER BY ri.sort_order;

-- ============================================================
-- QUERY 5: Calculate glass weight
--
-- Approximate glass weight factors:
-- 8mm  = 20 kg/m2
-- 10mm = 25 kg/m2
-- 12mm = 30 kg/m2
-- Application code should make these configurable.
-- ============================================================
WITH input AS (
    SELECT
        900::numeric AS width_mm,
        2100::numeric AS height_mm,
        10::numeric AS glass_mm
)
SELECT
    width_mm,
    height_mm,
    glass_mm,
    (width_mm / 1000) * (height_mm / 1000) AS area_m2,
    ROUND(
        (width_mm / 1000) *
        (height_mm / 1000) *
        CASE glass_mm
            WHEN 8 THEN 20
            WHEN 10 THEN 25
            WHEN 12 THEN 30
        END
    , 2) AS estimated_glass_weight_kg
FROM input;

-- ============================================================
-- QUERY 6: Dynamic quantity using weight
--
-- Example: if a matched hinge has quantity rules, select the
-- most specific matching quantity rule.
-- ============================================================
WITH input AS (
    SELECT
        900::numeric AS width_mm,
        2100::numeric AS height_mm,
        10::numeric AS glass_mm,
        47.25::numeric AS door_weight
),
matched_rule AS (
    SELECT id
    FROM recommendation_rule
    WHERE code = 'SWING-SINGLE-10-STD'
),
items AS (
    SELECT ri.*
    FROM recommendation_rule_item ri
    JOIN matched_rule r ON r.id = ri.rule_id
)
SELECT
    p.sku,
    p.name,
    COALESCE(q.quantity, i.quantity) AS final_quantity,
    p.price,
    COALESCE(q.quantity, i.quantity) * p.price AS line_price
FROM items i
JOIN product_sku p ON p.sku = i.sku
CROSS JOIN input x
LEFT JOIN LATERAL (
    SELECT qr.quantity
    FROM recommendation_quantity_rule qr
    WHERE qr.rule_item_id = i.id
      AND (qr.min_door_weight IS NULL OR x.door_weight >= qr.min_door_weight)
      AND (qr.max_door_weight IS NULL OR x.door_weight <= qr.max_door_weight)
      AND (qr.min_width IS NULL OR x.width_mm >= qr.min_width)
      AND (qr.max_width IS NULL OR x.width_mm <= qr.max_width)
      AND (qr.min_height IS NULL OR x.height_mm >= qr.min_height)
      AND (qr.max_height IS NULL OR x.height_mm <= qr.max_height)
    ORDER BY qr.priority DESC, qr.id DESC
    LIMIT 1
) q ON true
ORDER BY i.sort_order;

-- ============================================================
-- QUERY 7: Complete configurator result with total price
-- ============================================================
WITH input AS (
    SELECT '{
        "door_type":"single",
        "glass_thickness":"10",
        "door_width":900,
        "door_height":2100,
        "mounting_type":"glass_to_glass",
        "opening_type":"left",
        "finish":"sss",
        "handle_size":"600",
        "lock_type":"standard"
    }'::jsonb AS cfg
),
matched_rules AS (
    SELECT r.*
    FROM recommendation_rule r
    CROSS JOIN input i
    WHERE r.enabled
      AND r.family_id = (SELECT id FROM product_family WHERE code='GLASS_SWING_DOOR')
      AND NOT EXISTS (
          SELECT 1
          FROM recommendation_rule_condition c
          WHERE c.rule_id = r.id
            AND NOT (
                CASE c.operator
                    WHEN 'eq' THEN COALESCE(i.cfg ->> c.attribute_code, '') = c.value
                    WHEN 'neq' THEN COALESCE(i.cfg ->> c.attribute_code, '') <> c.value
                    WHEN 'gte' THEN COALESCE((i.cfg ->> c.attribute_code)::numeric, -1e18) >= c.value::numeric
                    WHEN 'lte' THEN COALESCE((i.cfg ->> c.attribute_code)::numeric,  1e18) <= c.value::numeric
                    ELSE false
                END
            )
      )
),
best_rule AS (
    SELECT *
    FROM matched_rules
    ORDER BY priority DESC
    LIMIT 1
),
lines AS (
    SELECT
        p.sku,
        p.name,
        p.product_type,
        ri.quantity,
        ri.required,
        p.unit,
        p.price,
        ri.quantity * p.price AS line_price,
        ri.sort_order
    FROM best_rule br
    JOIN recommendation_rule_item ri ON ri.rule_id = br.id
    JOIN product_sku p ON p.sku = ri.sku
)
SELECT
    sku,
    name,
    product_type,
    quantity,
    required,
    unit,
    price,
    line_price,
    SUM(line_price) OVER () AS hardware_total
FROM lines
ORDER BY sort_order;

-- ============================================================
-- QUERY 8: Test all saved configurations
-- ============================================================
WITH configs AS (
    SELECT
        tc.id,
        tc.name,
        tc.config,
        r.id AS rule_id,
        r.code AS rule_code,
        r.name AS rule_name,
        r.priority,
        ROW_NUMBER() OVER (
            PARTITION BY tc.id
            ORDER BY r.priority DESC
        ) AS rn
    FROM test_configuration tc
    JOIN recommendation_rule r
      ON r.enabled
     AND r.family_id = tc.family_id
    WHERE NOT EXISTS (
        SELECT 1
        FROM recommendation_rule_condition c
        WHERE c.rule_id = r.id
          AND NOT (
              CASE c.operator
                  WHEN 'eq' THEN COALESCE(tc.config ->> c.attribute_code, '') = c.value
                  WHEN 'neq' THEN COALESCE(tc.config ->> c.attribute_code, '') <> c.value
                  WHEN 'gte' THEN COALESCE((tc.config ->> c.attribute_code)::numeric, -1e18) >= c.value::numeric
                  WHEN 'lte' THEN COALESCE((tc.config ->> c.attribute_code)::numeric,  1e18) <= c.value::numeric
                  ELSE false
              END
          )
    )
)
SELECT
    id AS test_id,
    name AS test_name,
    rule_code,
    rule_name,
    priority
FROM configs
WHERE rn = 1
ORDER BY id;

-- ============================================================
-- QUERY 9: Count data for sanity check
-- ============================================================
SELECT 'product_family' AS table_name, COUNT(*) AS row_count FROM product_family
UNION ALL
SELECT 'configurator_attribute', COUNT(*) FROM configurator_attribute
UNION ALL
SELECT 'attribute_option', COUNT(*) FROM attribute_option
UNION ALL
SELECT 'product_sku', COUNT(*) FROM product_sku
UNION ALL
SELECT 'recommendation_rule', COUNT(*) FROM recommendation_rule
UNION ALL
SELECT 'recommendation_rule_condition', COUNT(*) FROM recommendation_rule_condition
UNION ALL
SELECT 'recommendation_rule_item', COUNT(*) FROM recommendation_rule_item
UNION ALL
SELECT 'recommendation_quantity_rule', COUNT(*) FROM recommendation_quantity_rule
UNION ALL
SELECT 'bom', COUNT(*) FROM bom
UNION ALL
SELECT 'bom_item', COUNT(*) FROM bom_item
UNION ALL
SELECT 'test_configuration', COUNT(*) FROM test_configuration;
