# ProductVariant 添加 recommendations 字段 — 设计文档

**日期:** 2026-07-30
**状态:** 已确认

## 概述

为 `ProductVariant` 数据表新增 `recommendations` 字段（JSON 数组），存储互补品推荐 SKU 列表及推荐理由。支持跨产品推荐，不做 SKU 范围限制。

## 数据模型

### Schema 变更

```prisma
model ProductVariant {
  id                Int      @id @default(autoincrement())
  productId         Int
  sku               String   @unique
  price             Decimal  @db.Decimal(10, 2)
  stock             Int      @default(0)
  optionCombination Json
  recommendations   Json?    // 新增：推荐 SKU 列表，含理由
  product           Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
}
```

### 数据格式

**类型:** `Json | null`

**结构:**
```json
[
  { "sku": "SKU-ACC-01", "reason": "Best Match" },
  { "sku": "SKU-WHT-L", "reason": "Customers also bought" }
]
```

每个元素包含：
- `sku` (string, required): 被推荐 variant 的 SKU
- `reason` (string, required): 推荐理由/标签，供前端展示

数组可为空数组 `[]` 或 `null`，均表示无推荐。

## 校验（Zod）

```typescript
export const recommendationItemSchema = z.object({
  sku: z.string().min(1),
  reason: z.string().min(1),
});

export const recommendationsSchema = z.array(recommendationItemSchema);
```

## Migration

```bash
pnpm prisma migrate dev --name add-recommendations-to-product-variant
```

Prisma 将生成 `ALTER TABLE "ProductVariant" ADD COLUMN "recommendations" JSONB;`

## Seed 数据

为 `SKU-BLK-M` variant 添加示例推荐：

```json
[
  { "sku": "SKU-WHT-M", "reason": "Alternative color" },
  { "sku": "SKU-BLK-L", "reason": "Larger size" }
]
```

## API 层变更

| 接口 | 变更 |
|---|---|
| `GET /api/products/:id` | 无需改动，`include: { variants: true }` 自动返回新字段 |
| `GET /api/products/:id/variants` | select 新增 `recommendations` |
| `POST /api/configurator/price` | 匹配到 variant 后返回 `recommendations` |

### 返回示例

```json
{
  "success": true,
  "data": {
    "price": 199,
    "sku": "SKU-BLK-M",
    "stock": 50,
    "recommendations": [
      { "sku": "SKU-WHT-M", "reason": "Alternative color" },
      { "sku": "SKU-BLK-L", "reason": "Larger size" }
    ]
  }
}
```

## 涉及文件

| 文件 | 动作 |
|---|---|
| `prisma/schema.prisma` | 新增 `recommendations Json?` 字段 |
| `src/lib/validations.ts` | 新增 `recommendationItemSchema` 和 `recommendationsSchema` |
| `prisma/seed.ts` | 为示例 variant 添加推荐数据 |
| `app/api/products/[id]/variants/route.ts` | select 新增 `recommendations` |
| `app/api/configurator/price/route.ts` | 返回附带 `recommendations` |
| `API-TESTS.md` | 更新 curl 测试示例 |

## 设计决策

- **JSON 列而非关联表**：与现有 `optionCombination` 风格一致，一条查询即可获取完整数据，适合验证型项目
- **不做参照完整性**：`recommendations` 是辅助营销数据，SKU 被删除后前端展示时按需过滤即可
- **不做反向查询**：不在此迭代中支持"谁推荐了我"查询
