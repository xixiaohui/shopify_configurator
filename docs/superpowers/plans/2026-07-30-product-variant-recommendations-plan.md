# ProductVariant recommendations 字段 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 ProductVariant 表新增 `recommendations` JSON 字段，支持存储带理由的推荐 SKU 列表，并更新相关 API 和 seed。

**Architecture:** JSON 列方案 — 在 Prisma schema 中新增 `recommendations Json?` 字段，Zod 校验格式，三个 API 路由按需适配，seed 添加示例数据。

**Tech Stack:** Prisma 7.9, PostgreSQL (JSONB), Zod 4.4, Next.js 16 App Router

## Global Constraints

- 纯后端 API 项目，无前端页面
- TypeScript strict
- REST API，JSON 响应格式统一为 `{ success, data }` 或 `{ success: false, error }`
- Zod 校验所有外部输入
- 遵循项目现有代码风格（3空间缩进，单引号，无分号，尾随逗号）

---

## 文件结构

| 文件 | 动作 | 职责 |
|---|---|---|
| `prisma/schema.prisma` | Modify | 新增 `recommendations Json?` 字段 |
| `prisma/seed.ts` | Modify | 为 SKU-BLK-M 添加示例推荐数据 |
| `src/lib/validations.ts` | Modify | 新增 `recommendationItemSchema` |
| `app/api/products/[id]/variants/route.ts` | Modify | select 中新增强 `recommendations` |
| `app/api/configurator/price/route.ts` | Modify | 响应中附带 `recommendations` |
| `API-TESTS.md` | Modify | 更新 curl 示例 |

---

### Task 1: Prisma Schema 新增 recommendations 字段

**Files:**
- Modify: `prisma/schema.prisma:48`

**Interfaces:**
- Produces: `ProductVariant.recommendations: Json?` — 可选 JSON 字段，存储 `{ sku: string, reason: string }[]`

- [ ] **Step 1: 在 schema 中添加字段**

在 `prisma/schema.prisma` 的 `optionCombination Json` 下一行插入：

```prisma
  recommendations   Json?
```

目标位置确认：在 `optionCombination Json` 之后、`product Product @relation(...)` 之前。

- [ ] **Step 2: 运行 Prisma migration**

```bash
cd e:/workspace/shopify/shopify_configurator/shopify_configurator && pnpm prisma migrate dev --name add-recommendations-to-product-variant
```

预期：生成 `prisma/migrations/<timestamp>_add_recommendations_to_product_variant/migration.sql`，内容为 `ALTER TABLE "ProductVariant" ADD COLUMN "recommendations" JSONB;`

- [ ] **Step 3: 运行 generate 重新生成 Prisma 客户端**

```bash
pnpm prisma generate
```

- [ ] **Step 4: 验证 — 确认 Prisma Client 类型包含新字段**

```bash
pnpm exec tsc --noEmit
```

预期：编译通过，无类型错误。

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add recommendations JSON field to ProductVariant"
```

---

### Task 2: Zod 校验 Schema

**Files:**
- Modify: `src/lib/validations.ts:1-9`

**Interfaces:**
- Produces: `recommendationItemSchema` — Zod schema，校验单个推荐项 `{ sku: string, reason: string }`

- [ ] **Step 1: 新增 Zod schema**

在 `src/lib/validations.ts` 文件末尾追加（保留原有 `priceRequestSchema` 和 `PriceRequest` 类型）：

```typescript
export const recommendationItemSchema = z.object({
  sku: z.string().min(1),
  reason: z.string().min(1),
})

export const recommendationsSchema = z.array(recommendationItemSchema)
```

- [ ] **Step 2: 验证编译**

```bash
pnpm exec tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/validations.ts
git commit -m "feat: add recommendationItemSchema Zod validation"
```

---

### Task 3: Seed 数据添加示例推荐

**Files:**
- Modify: `prisma/seed.ts:85-96`

**Interfaces:**
- Consumes: `ProductVariant.recommendations: Json?` (from Task 1)
- Produces: seed 数据中 SKU-BLK-M 包含示例 recommendations

- [ ] **Step 1: 在 variant 循环中为 SKU-BLK-M 添加 recommendations**

将 seed.ts 第 85-96 行的 variant 创建循环替换为：

```typescript
  for (const v of variants) {
    const data: Record<string, unknown> = {
      productId: product.id,
      sku: v.sku,
      price: v.price,
      stock: 50,
      optionCombination: v.combination,
    }

    // Add sample recommendations for SKU-BLK-M
    if (v.sku === "SKU-BLK-M") {
      data.recommendations = [
        { sku: "SKU-WHT-M", reason: "Alternative color" },
        { sku: "SKU-BLK-L", reason: "Larger size" },
      ]
    }

    await prisma.productVariant.create({
      data: data as Parameters<typeof prisma.productVariant.create>[0]["data"],
    })
    console.log(`Created variant: ${v.sku}`)
  }
```

- [ ] **Step 2: 验证 — 运行 seed**

```bash
cd e:/workspace/shopify/shopify_configurator/shopify_configurator && pnpm db:seed
```

预期：输出 `Created variant: SKU-BLK-M`, `SKU-BLK-L`, `SKU-WHT-M`, `SKU-WHT-L`，无报错。

- [ ] **Step 3: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat: add sample recommendations to seed data"
```

---

### Task 4: Variants API 返回 recommendations

**Files:**
- Modify: `app/api/products/[id]/variants/route.ts:23-32`

**Interfaces:**
- Consumes: `ProductVariant.recommendations: Json?` (from Task 1)
- Produces: `GET /api/products/:id/variants` 响应的每个 variant 包含 `recommendations`

- [ ] **Step 1: select 新增 recommendations**

在 `route.ts` 的 `select` 对象中，`optionCombination: true` 之后新增一行：

```typescript
        recommendations: true,
```

修改后 select 块为：

```typescript
      select: {
        id: true,
        sku: true,
        price: true,
        stock: true,
        optionCombination: true,
        recommendations: true,
      },
```

- [ ] **Step 2: 验证编译**

```bash
pnpm exec tsc --noEmit
```

- [ ] **Step 3: 手动测试 — 启动 dev server 并调用 API**

```bash
# Terminal 1: 启动服务
cd e:/workspace/shopify/shopify_configurator/shopify_configurator && pnpm dev
```

```bash
# Terminal 2: 测试（等待服务启动后）
curl -s http://localhost:3000/api/products/1/variants | jq
```

预期：SKU-BLK-M 的返回中包含 `"recommendations": [{"sku": "SKU-WHT-M", "reason": "Alternative color"}, {"sku": "SKU-BLK-L", "reason": "Larger size"}]`，其他 variant 的 `recommendations` 为 `null`。

- [ ] **Step 4: Commit**

```bash
git add app/api/products/[id]/variants/route.ts
git commit -m "feat: include recommendations in variants API response"
```

---

### Task 5: Price API 返回 recommendations

**Files:**
- Modify: `app/api/configurator/price/route.ts:88-92`

**Interfaces:**
- Consumes: `matchedVariant.recommendations: Json?` (from Task 1)
- Produces: `POST /api/configurator/price` 响应的 `data` 中包含 `recommendations`

- [ ] **Step 1: 在 success 响应中添加 recommendations 字段**

将 return success 调用（第 88-92 行）修改为：

```typescript
    return success({
      price: totalPrice,
      sku: matchedVariant.sku,
      stock: matchedVariant.stock,
      recommendations: matchedVariant.recommendations,
    }, 200, corsHeaders);
```

- [ ] **Step 2: 验证编译**

```bash
pnpm exec tsc --noEmit
```

- [ ] **Step 3: 手动测试 — 调用 price API**

```bash
curl -s -X POST http://localhost:3000/api/configurator/price \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "options": {"Color": "Black", "Size": "M"}}' | jq
```

预期：

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

```bash
curl -s -X POST http://localhost:3000/api/configurator/price \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "options": {"Color": "White", "Size": "L"}}' | jq
```

预期：`recommendations` 为 `null`（因为 SKU-WHT-L 没有推荐数据）。

- [ ] **Step 4: Commit**

```bash
git add app/api/configurator/price/route.ts
git commit -m "feat: include recommendations in price API response"
```

---

### Task 6: 更新 API 测试文档

**Files:**
- Modify: `API-TESTS.md:57-98`

**Interfaces:**
- Consumes: API 响应格式变更 (from Task 4, Task 5)

- [ ] **Step 1: 更新 variant 测试期望**

在 `API-TESTS.md` 第 51 行的 "期望返回 4 个 variant" 之后，增加对 recommendations 的说明：

```markdown
期望返回 4 个 variant（Black+M、Black+L、White+M、White+L）。
其中 `SKU-BLK-M` 的 `recommendations` 字段包含示例推荐数据，其余 variant 的 `recommendations` 为 `null`。
```

- [ ] **Step 2: 更新 price API 测试期望**

将所有 price 测试中的期望 JSON 添加 `"recommendations"` 字段。Black+M（第 67-76 行）改为：

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

其余三个组合（White+L, Black+L, White+M）的期望中 `recommendations` 为 `null`。

- [ ] **Step 3: Commit**

```bash
git add API-TESTS.md
git commit -m "docs: update API tests with recommendations field"
```

---

## 验证清单

完成所有 task 后，执行以下端到端验证：

- [ ] `pnpm exec tsc --noEmit` — 编译通过
- [ ] `pnpm db:seed` — seed 成功，数据正确
- [ ] `curl http://localhost:3000/api/products/1/variants | jq` — SKU-BLK-M 含 recommendations
- [ ] `curl -X POST ... /api/configurator/price -d '{"productId":1,"options":{"Color":"Black","Size":"M"}}'` — 返回含 recommendations
- [ ] `curl -X POST ... /api/configurator/price -d '{"productId":1,"options":{"Color":"White","Size":"L"}}'` — 返回含 `"recommendations":null`
