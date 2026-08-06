# PRODUCT.md — 产品需求

## 定位
面向玻璃门五金制造商、经销商、工程商和 B2B 销售的在线配置、推荐、BOM 与报价工具。

## 角色
- Customer：配置、查看推荐、下载 BOM、询价
- Sales：查看配置、报价、跟进
- Product Manager：SKU、属性、兼容关系
- Rule Manager：推荐规则
- Admin：全部权限

## Configurator 输入
Door：family、door_type、opening_type、mounting_type
Glass：thickness_mm、width_mm、height_mm
Finish：finish
Quantity：door_quantity

## Derived Values
width_m、height_m、area_m2、glass_weight_kg、door_leaf_weight_kg、weight_class、size_class。
默认玻璃密度 2500 kg/m³。
weight = width_m × height_m × thickness_m × 2500。

## 推荐结果
category、sku、name、quantity、unit_price、extended_price、reason、rule_code、priority。

## BOM
configuration_id、SKU、description、quantity、unit_price、total_price、source_rule、required、optional。

## Quote
customer、company、email、phone、project_name、configuration snapshot、BOM snapshot、quantity、notes、status。
状态：draft / submitted / reviewing / quoted / accepted / rejected / expired。

## UX
5 步：Door → Glass → Dimensions → Mounting & Opening → Finish。
右侧固定 Configuration Summary。
结果页：配置摘要、重量、推荐五金、推荐原因、BOM、估价、Request Quote。

## MVP 不做
支付、CAD 自动出图、ERP 双向同步、AI 自主改规则、Shopify checkout、多租户计费。
