# DATABASE.md — PostgreSQL 数据模型

## 核心表
product_family
product_category
product_sku
product_attribute
product_attribute_option
recommendation_rule
recommendation_rule_condition
recommendation_rule_item
product_compatibility
configuration
configuration_value
configuration_result
configuration_bom_item
quote
quote_item

## 关系
product_family → recommendation_rule → recommendation_rule_condition
recommendation_rule → recommendation_rule_item → product_sku
product_sku → product_compatibility
configuration → configuration_value → configuration_result → configuration_bom_item
configuration → quote → quote_item

## product_sku
id、sku、name、category_id、description、material、finish、min_glass_thickness_mm、max_glass_thickness_mm、max_door_weight_kg、price、currency、status、metadata、created_at、updated_at。

## recommendation_rule
id、family_id、code、name、priority、active、rule_version、explanation、valid_from、valid_to、created_at、updated_at。

## recommendation_rule_condition
id、rule_id、attribute_code、operator、value_jsonb、sort_order。

## recommendation_rule_item
id、rule_id、sku_id、quantity_mode、fixed_quantity、min_quantity、max_quantity、required、sort_order。

## 约束
SKU UNIQUE；family code UNIQUE；rule code + version UNIQUE；attribute code UNIQUE；option code + attribute_id UNIQUE；所有关系 FK。

## 数据类型
money：numeric(12,2)
尺寸：numeric
时间：timestamptz
扩展字段：jsonb

## 索引
product_sku(sku)、product_sku(category_id)、product_sku(status)、recommendation_rule(family_id, active, priority)、recommendation_rule_condition(rule_id)、recommendation_rule_condition(attribute_code)、recommendation_rule_item(rule_id)、recommendation_rule_item(sku_id)、configuration(created_at)、quote(status, created_at)。

## 原则
核心关系不要全部塞进 JSONB。Schema 变化必须 migration。seed 可重复运行。历史配置必须保存 snapshot，避免规则变化影响历史报价。
