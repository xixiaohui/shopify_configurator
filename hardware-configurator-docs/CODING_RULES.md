# CODING_RULES.md

## TypeScript
strict=true；避免 any；domain type 优先；API 输入输出显式类型；Zod 推导输入。

## React
Server Component 默认；交互组件才 use client；组件不得直接写 SQL 或实现规则。

## Architecture
Route Handler → Service → Repository → PostgreSQL。

推荐目录：
app/
components/
features/configurator/
features/products/
features/quotes/
features/admin/
lib/db/
lib/validation/
lib/calculations/
server/services/
server/repositories/
server/rules/

## Database
FK 必须明确；money 用 numeric；删除行为明确；SQL 参数化；大表索引；生产 API 不使用 SELECT *。

## Naming
TS camelCase；DB snake_case；API REST；SKU 大写连字符。

## Errors
CONFIGURATION_INVALID、NO_RULE_MATCH、SKU_INCOMPATIBLE、PRODUCT_INACTIVE、QUOTE_INVALID、UNAUTHORIZED、FORBIDDEN、NOT_FOUND。

## Testing
覆盖正常、边界、无匹配、多匹配、无效 SKU、失效规则、重复提交。

## Git
feat: / fix: / refactor: / test: / docs: / chore:

## Security
secret 只放 env；所有输入验证；server-side authorization；rate limit public endpoint；admin mutation audit。
