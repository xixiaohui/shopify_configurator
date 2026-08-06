# UI.md — 前端规范

## 页面
/ 
/configurator
/configuration/[id]
/quote
/products
/products/[sku]
/admin
/admin/products
/admin/rules
/admin/configurations
/admin/quotes

## Configurator
五步：Door → Glass → Dimensions → Mounting/Opening → Finish。
左侧 controls，右侧 preview + derived values + summary，底部 Back/Continue。

## Result
configuration summary、area、glass weight、matched rule、recommendations、Why Recommended、BOM、subtotal、Request Quote。

## Product Card
image、SKU、name、finish、compatibility、price、quantity。

## Admin
DataTable、filter、search、pagination、drawer/dialog、form validation、confirmation。

## 必备状态
loading、empty、error、success、disabled、validation error。

## 响应式
desktop 双栏；tablet 上下；mobile stepper + sticky summary。

## 组件建议
components/configurator/ConfiguratorShell、Stepper、DoorTypeStep、GlassThicknessStep、DimensionStep、MountingStep、FinishStep、DoorPreview、ConfigurationSummary、RecommendationList、RecommendationCard、BomTable。
components/admin/ProductTable、RuleTable、RuleForm、ConditionBuilder。

## 原则
Server Component 默认；只有交互需要才 use client。UI 不直接访问 DB，不包含规则逻辑。
