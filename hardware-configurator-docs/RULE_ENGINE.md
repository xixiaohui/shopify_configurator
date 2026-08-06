# RULE_ENGINE.md — 推荐规则引擎

## Rule
Rule 表示一个可匹配场景。例如：
SWING-SINGLE-10-STD：
door_type = single
glass_thickness = 10
mounting_type = glass_to_glass
width <= 900
height <= 2100
finish IN [sss, black]

## Condition
attribute_code + operator + value_jsonb。
同一 rule 条件默认 AND。

## 多规则
多个规则可同时匹配。排序：
1. priority DESC
2. specificity DESC
3. rule_version DESC

## Rule Item
决定推荐 SKU，例如：
HINGE-G2G-90-BLK × 2
HANDLE-600-BLK × 1
LOCK-GLASS-BLK × 1
SEAL-PVC-10MM × 2

## Quantity
fixed：固定数量。
calculated：由尺寸/重量计算。
formula：未来支持受限表达式，禁止 eval 任意输入。

## Compatibility
推荐后必须再次检查 SKU 兼容性：玻璃厚度、门扇重量、安装方式、finish 等。

## Conflict
同一 category 多规则冲突时按 category policy 决定 winner 或 merge；hinge 可合并数量，lock 默认 single winner。

## Explanation
每个推荐项应解释原因，例如：10mm glass、estimated weight 47.25kg、glass-to-glass、black finish、hinge supports up to 60kg。

## 测试
覆盖 no match、single match、multiple match、边界值、不兼容 SKU、inactive/expired rule、重复 SKU、重量和数量边界。
