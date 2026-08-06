# API.md — REST API

Base path：/api/v1

## POST /configurations/preview
输入：familyCode、doorType、glassThicknessMm、widthMm、heightMm、mountingType、openingType、finish。
返回 configuration、derived、matchedRules、hardware、bom、pricing、warnings。

## POST /configurations
保存正式配置并保存 snapshot。

## GET /configurations/:id
读取配置及 BOM。

## POST /quotes
提交询价。

## GET /products
支持 category、finish、glassThickness、status、search、page、pageSize。

## GET /products/:sku
读取 SKU。

## Admin
GET/POST /admin/rules
GET/PATCH /admin/rules/:id
POST /admin/rules/:id/duplicate
GET/POST /admin/products
PATCH /admin/products/:id
GET /admin/quotes
PATCH /admin/quotes/:id

## 统一错误
{
  "error": {
    "code": "CONFIGURATION_INVALID",
    "message": "Door width exceeds supported range.",
    "details": {}
  }
}

业务错误码：CONFIGURATION_INVALID、NO_RULE_MATCH、SKU_INCOMPATIBLE、PRODUCT_INACTIVE、QUOTE_INVALID、UNAUTHORIZED、FORBIDDEN、NOT_FOUND。

所有输入 Zod 校验；分页统一；admin API server-side authorization；禁止暴露数据库异常；mutation 记录 audit。
