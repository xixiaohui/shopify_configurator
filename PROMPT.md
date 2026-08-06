# Glass Door Hardware Configurator

# Claude Code Development Specification

> 项目名称：Glass Door Hardware Configurator
> 项目类型：B2B Glass Door Hardware Product Configurator
> 当前 MVP 产品：Glass Swing Door
> 目标：将 PostgreSQL 中的玻璃门五金产品、推荐规则、BOM 数据转化为一个可实际使用的 B2B 在线配置器。

---

# 1. 项目目标

开发一个现代化 B2B Glass Door Hardware Configurator。

客户可以在线配置一扇 Glass Swing Door：

```text
Door Type
Glass Thickness
Width
Height
Opening
Mounting
Finish
```

系统根据客户输入：

```text
用户配置
    ↓
参数校验
    ↓
玻璃面积计算
    ↓
玻璃重量估算
    ↓
推荐规则匹配
    ↓
五金兼容性判断
    ↓
五金数量计算
    ↓
生成 Hardware BOM
    ↓
计算 Hardware Price
    ↓
Request Quote
```

最终给客户：

```text
Configuration
+
Recommended Hardware
+
BOM
+
Estimated Price
+
Request Quote
```

---

# 2. 当前 MVP 范围

第一阶段只实现：

```text
Glass Swing Door
```

不要在第一阶段开发：

```text
Shower Door
Sliding Door
Pivot Door
Automatic Door
ERP Integration
Shopify App
Payment
Order Management
复杂 CRM
```

但是数据库和代码结构必须支持以后增加这些 Product Family。

---

# 3. 技术栈

使用：

```text
Next.js 16+
React
TypeScript
App Router

Tailwind CSS
shadcn/ui
Radix UI
Lucide React

PostgreSQL

Zod

React Hook Form

TanStack Query（如果确有必要）

Prisma 可选
```

优先：

```text
Next.js Route Handlers
+
PostgreSQL
```

不要为了简单功能引入过多第三方依赖。

---

# 4. 数据库

项目已经提供：

```text
glass_swing_door_configurator.sql
```

该 SQL 文件是当前项目数据库的基础数据源。

执行该 SQL 后应该得到：

```text
product_family

configurator_attribute

attribute_option

product_sku

recommendation_rule

recommendation_rule_condition

recommendation_rule_item

recommendation_quantity_rule

sku_compatibility

bom

bom_item

test_configuration
```

开发前必须：

1. 阅读完整 SQL
2. 理解表结构
3. 理解外键关系
4. 理解测试数据
5. 理解 recommendation rule
6. 理解 BOM
7. 不要随意修改数据库结构

如果发现 SQL 中存在明显结构问题，先记录到：

```text
docs/DATABASE_ISSUES.md
```

不要擅自破坏已有结构。

glass_swing_door_configurator.sql 是当前项目数据库的基础数据源,已经用脚本run_sql.js执行过了，数据库已经在远程创建。
---

# 5. 数据库关系

核心关系：

```text
product_family
      │
      ▼
recommendation_rule
      │
      ├── recommendation_rule_condition
      │
      └── recommendation_rule_item
                    │
                    ▼
              product_sku
```

配置：

```text
configurator_attribute
        │
        ▼
attribute_option
```

数量：

```text
recommendation_rule_item
        │
        ▼
recommendation_quantity_rule
```

兼容性：

```text
product_sku
      │
      ▼
sku_compatibility
      │
      ▼
product_sku
```

BOM：

```text
bom
 │
 ▼
bom_item
 │
 ▼
product_sku
```

---

# 6. Product Configurator

页面：

```text
/configurator
```

使用左右两栏布局。

左侧：

```text
Configuration
```

右侧：

```text
Door Preview
Calculation Summary
```

---

# 7. 配置步骤

必须支持：

## Step 1 Door Type

```text
Single Door
Double Door
```

---

## Step 2 Glass Thickness

```text
8mm
10mm
12mm
```

---

## Step 3 Door Width

单位：

```text
mm
```

例如：

```text
600 - 1200mm
```

必须进行 Zod 校验。

---

## Step 4 Door Height

单位：

```text
mm
```

例如：

```text
1800 - 2400mm
```

---

## Step 5 Opening

```text
Left
Right
Double
```

---

## Step 6 Mounting Type

```text
Glass-to-Glass
Glass-to-Wall
```

---

## Step 7 Finish

```text
SSS
PSS
Black
Gold
```

---

# 8. 配置器 UI

整体布局：

```text
┌─────────────────────────────────────────────────────┐
│ Glass Swing Door Configurator                       │
├─────────────────────┬───────────────────────────────┤
│                     │                               │
│ Configuration       │       Door Preview            │
│                     │                               │
│ Door Type           │                               │
│ ○ Single            │        ┌──────────┐           │
│ ○ Double            │        │          │           │
│                     │        │   GLASS  │           │
│ Glass Thickness     │        │          │           │
│ ○ 8mm               │        │          │           │
│ ● 10mm              │        └──────────┘           │
│ ○ 12mm              │                               │
│                     │                               │
│ Width               │                               │
│ [900] mm            │                               │
│                     │                               │
│ Height              │                               │
│ [2100] mm           │                               │
│                     │                               │
│ Mounting            │                               │
│ ○ Glass-to-Glass    │                               │
│ ○ Glass-to-Wall     │                               │
│                     │                               │
│ Finish              │                               │
│ ○ SSS               │                               │
│ ● Black             │                               │
│ ○ Gold              │                               │
│                     │                               │
├─────────────────────┴───────────────────────────────┤
│ Estimated Weight: 47.25 kg                          │
│                                                     │
│                  [ Get Hardware Package ]            │
└─────────────────────────────────────────────────────┘
```

UI 要求：

* Desktop 优先
* Mobile Responsive
* shadcn/ui
* 简洁工业 B2B 风格
* 不使用过度动画
* 不做花哨 SaaS Dashboard 风格
* 强调产品、尺寸、参数、价格
* 所有表单都有明确错误提示

---

# 9. Door Preview

MVP 不要求 3D。

使用：

```text
SVG
CSS
```

绘制简单门示意图。

根据配置动态显示：

```text
Single / Double
Left / Right
Width
Height
```

例如：

```text
Single Door

┌──────────────┐
│              │
│      │       │
│      │       │
│              │
└──────────────┘
```

Width / Height 改变时，SVG 示意图比例应该随之变化。

---

# 10. 实时计算

配置发生变化时，显示：

```text
Door Area
Glass Weight
Recommended Hardware Class
```

公式：

```text
width_m = width / 1000

height_m = height / 1000

area = width_m * height_m
```

玻璃重量：

```text
glass_weight = area * glass_weight_per_m2
```

不同玻璃厚度需要有对应重量参数。

不要把这些计算散落在 React Component 中。

创建：

```text
src/domain/configurator/calculator.ts
```

负责：

```text
calculateDoorArea()
calculateGlassWeight()
calculateDoorSize()
```

所有计算函数必须是纯函数。

---

# 11. Rule Engine

建立：

```text
src/domain/configurator/rule-engine.ts
```

核心函数：

```ts
matchRecommendationRules(
  configuration
)
```

职责：

```text
用户配置
    ↓
匹配 recommendation_rule
    ↓
检查 recommendation_rule_condition
    ↓
返回匹配规则
```

不要把业务规则写成大量：

```ts
if (glass === "10mm") ...
else if (...)
```

规则必须尽量来自 PostgreSQL。

---

# 12. Rule Matching

规则需要支持：

```text
=
!=
<
<=
>
>=
IN
```

例如：

```text
door_type = single
glass_thickness = 10
door_width <= 900
door_height <= 2100
mounting_type = glass_to_glass
```

规则匹配必须支持多个条件。

只有全部满足：

```text
AND
```

才认为 Rule 匹配。

---

# 13. Rule Priority

如果多个规则都匹配：

```text
priority DESC
```

优先使用 priority 高的规则。

例如：

```text
General Rule
priority = 10

Heavy Duty Rule
priority = 100
```

当两者都匹配时：

```text
Heavy Duty Rule
```

优先。

---

# 14. Hardware Recommendation

API 返回：

```json
{
  "configuration": {},
  "calculation": {},
  "rule": {},
  "hardware": []
}
```

hardware：

```json
[
  {
    "sku": "HINGE-HD-90-BLK",
    "name": "Heavy Duty 90° Glass Hinge",
    "category": "hinge",
    "quantity": 2,
    "required": true,
    "unitPrice": 32,
    "totalPrice": 64
  }
]
```

---

# 15. Hardware Category

前端按 Category 分组：

```text
Hinges
Handles
Locks
Floor Springs
Door Closers
Glass Clamps
Seals
Accessories
```

UI：

```text
Recommended Hardware

Hinges
────────────────────────
Heavy Duty 90° Hinge
SKU: HINGE-HD-90-BLK

Qty: 2
$32 × 2 = $64


Handles
────────────────────────
600mm Pull Handle

Qty: 1
$22
```

---

# 16. Why Recommended

每个推荐产品必须允许展开：

```text
Why this product?
```

例如：

```text
Your door:

10mm glass
900 × 2100mm

Estimated glass weight:

47.25kg

Recommended hinge:

Heavy Duty

Maximum supported weight:

60kg
```

显示：

```text
✓ Glass thickness compatible
✓ Door weight compatible
✓ Door size compatible
✓ Mounting compatible
✓ Finish available
```

---

# 17. Quantity Engine

不要把数量全部写死。

根据：

```text
door width
door height
glass thickness
glass weight
```

查询：

```text
recommendation_quantity_rule
```

例如：

```text
≤ 40kg
→ 2 hinges

40-60kg
→ 3 hinges

> 60kg
→ Heavy Duty / configuration warning
```

建立：

```text
src/domain/configurator/quantity-engine.ts
```

核心：

```ts
calculateHardwareQuantity()
```

---

# 18. SKU Compatibility

推荐五金之后，还要检查：

```text
sku_compatibility
```

例如：

```text
HINGE-HD-90-BLK
compatible_with
10mm / 12mm glass
```

如果 SKU 不兼容：

```text
不要推荐
```

如果发现兼容冲突：

```text
返回明确 warning
```

---

# 19. BOM

用户完成配置后：

```text
View Hardware BOM
```

页面：

```text
Hardware BOM

Glass Swing Door
Single Door
10mm
900 × 2100mm
Black


SKU                  Qty     Unit       Total
------------------------------------------------
HINGE-HD-90-BLK       2       $32        $64
HANDLE-600-BLK        1       $22        $22
LOCK-GLASS-BLK        1       $35        $35
SEAL-PVC-10MM         2       $4         $8
------------------------------------------------
Total                                    $129
```

---

# 20. BOM 计算

建立：

```text
src/domain/configurator/bom.ts
```

核心：

```ts
generateBom()
calculateBomTotal()
```

每个 BOM Item：

```ts
{
  sku,
  name,
  category,
  quantity,
  unitPrice,
  totalPrice
}
```

---

# 21. Quote 页面

路由：

```text
/quote
```

表单：

```text
Company
Contact Name
Email
Phone
Project Name
Quantity
Notes
```

配置自动带入：

```text
Configuration
BOM
Estimated Price
```

提交之后暂时写入数据库。

如果当前 SQL 没有 quote 表：

创建 migration：

```text
quotes
quote_items
```

不要修改原始 SQL 文件。

---

# 22. Quote 数据

建议：

```text
quotes

id
quote_number
company_name
contact_name
email
phone
project_name
quantity
configuration JSONB
estimated_total
status
created_at
```

状态：

```text
draft
submitted
reviewing
quoted
closed
```

quote_items：

```text
id
quote_id
sku
quantity
unit_price
total_price
```

---

# 23. API

使用 Next.js Route Handlers。

API：

```text
GET
/api/configurator/families

GET
/api/configurator/attributes?family=GLASS_SWING_DOOR

POST
/api/configurator/validate

POST
/api/configurator/recommend

POST
/api/configurator/bom

POST
/api/quotes

GET
/api/quotes/:id
```

---

# 24. Recommend API

请求：

```json
{
  "family": "GLASS_SWING_DOOR",
  "configuration": {
    "doorType": "single",
    "glassThickness": 10,
    "width": 900,
    "height": 2100,
    "opening": "left",
    "mounting": "glass_to_glass",
    "finish": "black"
  }
}
```

返回：

```json
{
  "configuration": {},
  "calculation": {
    "area": 1.89,
    "glassWeight": 47.25
  },
  "matchedRule": {},
  "hardware": [],
  "bom": {
    "subtotal": 129
  },
  "warnings": []
}
```

---

# 25. API 层结构

不要把 SQL、业务计算、HTTP Response 全部写在 Route Handler。

推荐：

```text
app/api/configurator/recommend/route.ts
        ↓
application service
        ↓
domain/rule-engine
        ↓
repository
        ↓
PostgreSQL
```

目录：

```text
src/
├── domain/
│   └── configurator/
│       ├── calculator.ts
│       ├── rule-engine.ts
│       ├── quantity-engine.ts
│       ├── compatibility.ts
│       └── bom.ts
│
├── application/
│   └── configurator/
│       └── recommend-service.ts
│
├── infrastructure/
│   └── db/
│       ├── client.ts
│       └── repositories/
│
└── types/
    └── configurator.ts
```

---

# 26. Repository

数据库查询不要散落在页面组件里。

例如：

```ts
getProductFamily()
getConfiguratorAttributes()
getRecommendationRules()
getRuleConditions()
getRuleItems()
getProductSku()
getQuantityRules()
getSkuCompatibility()
```

所有 PostgreSQL 查询集中管理。

---

# 27. PostgreSQL 查询原则

复杂查询优先使用：

```sql
WITH ...
```

CTE。

推荐结构：

```text
WITH user_config AS (...),

matched_rules AS (...),

rule_items AS (...),

compatible_skus AS (...),

quantity_calculation AS (...)

SELECT ...
```

不要写一个 500 行难以维护的 SQL。

---

# 28. SQL 与业务代码的职责

SQL：

```text
数据查询
JOIN
WHERE
GROUP BY
排序
过滤
聚合
```

TypeScript：

```text
业务流程
计算
参数验证
规则解释
API
响应结构
```

不要把整个业务规则塞到 SQL 中。

---

# 29. Frontend 状态

Configurator 状态必须集中管理。

例如：

```ts
type DoorConfiguration = {
  doorType: "single" | "double"
  glassThickness: 8 | 10 | 12
  width: number
  height: number
  opening: "left" | "right" | "double"
  mounting: "glass_to_glass" | "glass_to_wall"
  finish: "sss" | "pss" | "black" | "gold"
}
```

配置状态改变：

```text
configuration
     ↓
validation
     ↓
API
     ↓
recommendation
```

---

# 30. 页面结构

实现：

```text
/
```

Home。

```text
/configurator
```

Configurator。

```text
/configuration/result
```

推荐结果。

```text
/configuration/bom
```

BOM。

```text
/quote
```

Quote。

```text
/admin
```

Admin Dashboard。

---

# 31. Home 页面

首页：

```text
GLASS DOOR HARDWARE CONFIGURATOR

Configure your glass door.
Get compatible hardware instantly.

[ Start Configuration ]
```

下面：

```text
Why use our configurator?

✓ Compatible Hardware
✓ Automatic Hardware Selection
✓ Automatic BOM
✓ Instant Price Estimate
✓ Request a Quote
```

不要做过度营销。

---

# 32. Admin Dashboard

实现：

```text
/admin
```

展示：

```text
Products
Rules
Configurations
Quotes
```

统计：

```text
50 Products
25 Rules
128 Configurations
37 Quotes
```

---

# 33. Admin Products

```text
/admin/products
```

支持：

```text
搜索 SKU
分类过滤
状态过滤
查看详情
```

暂时不要求复杂 CRUD。

---

# 34. Admin Rules

```text
/admin/rules
```

显示：

```text
Rule Name
Priority
Conditions
Recommended Products
Enabled
```

支持：

```text
查看
编辑
启用/禁用
```

如果 CRUD 工作量较大，第一版可以先实现 Read Only。

---

# 35. Admin Quotes

```text
/admin/quotes
```

显示：

```text
Quote Number
Company
Contact
Configuration
Amount
Status
Created
```

支持：

```text
查看详情
修改状态
```

---

# 36. UI Design

整体：

```text
B2B Industrial
Modern
Professional
Minimal
```

避免：

```text
过度渐变
大面积玻璃拟态
游戏化
复杂动画
过度 SaaS 风格
```

建议：

```text
白色 / 灰色背景
深色文字
细边框
中等圆角
清晰的产品图片
清晰数字
```

产品配置区域必须非常清晰。

---

# 37. Responsive

必须支持：

```text
Desktop
Tablet
Mobile
```

Mobile：

```text
Configuration
     ↓
Door Preview
     ↓
Calculation
     ↓
Recommended Hardware
```

不要在手机上强制左右双栏。

---

# 38. Loading / Error / Empty

所有 API 请求必须处理：

```text
loading
error
empty
success
```

例如：

```text
Finding compatible hardware...
```

错误：

```text
Unable to find compatible hardware.

Please adjust your glass thickness or door dimensions.
```

不要直接显示：

```text
500 Internal Server Error
```

---

# 39. Validation

使用 Zod。

必须检查：

```text
Door Type
Glass Thickness
Width
Height
Mounting
Finish
```

例如：

```text
Width < 600
```

提示：

```text
Minimum door width is 600mm.
```

例如：

```text
Width > 1200
```

提示：

```text
Maximum supported door width is 1200mm.
```

---

# 40. Test Configurations

SQL 已经提供测试配置。

至少测试：

### Test A

```text
Single
10mm
900 × 2100
Glass-to-Glass
SSS
```

### Test B

```text
Single
10mm
1100 × 2200
Glass-to-Glass
Black
```

### Test C

```text
Single
12mm
1200 × 2400
Glass-to-Glass
SSS
```

### Test D

```text
Double
10mm
900 × 2100
Glass-to-Glass
SSS
```

### Test E

```text
Single
10mm
900 × 2100
Glass-to-Wall
Black
```

---

# 41. 必须测试的业务场景

## Case 1

正常配置：

```text
Single
10mm
900
2100
Glass-to-Glass
SSS
```

应该：

```text
找到 Rule
找到 Hinge
找到 Handle
找到 Lock
生成 BOM
计算价格
```

---

## Case 2

Heavy Door：

```text
Single
12mm
1200
2400
```

必须：

```text
使用 Heavy Duty Hardware
```

---

## Case 3

不支持的尺寸：

```text
Width = 1500
```

应该：

```text
validation error
```

---

## Case 4

没有匹配规则。

应该：

```text
No compatible hardware package found.
```

而不是返回错误页面。

---

## Case 5

SKU 不兼容。

应该：

```text
Hardware compatibility warning
```

---

# 42. SEO

第一阶段只做基础 SEO：

```text
title
description
Open Graph
favicon
```

首页：

```text
Glass Door Hardware Configurator
```

Configurator：

```text
Glass Swing Door Hardware Configurator
```

---

# 43. Security

必须：

```text
环境变量保存 DATABASE_URL
```

禁止：

```text
把数据库密码写进代码
```

禁止：

```text
NEXT_PUBLIC_DATABASE_URL
```

所有数据库访问只能：

```text
Server Side
```

不要把数据库连接暴露给浏览器。

API 必须进行：

```text
Zod validation
```

---

# 44. Environment

创建：

```text
.env.example
```

内容：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/glass_configurator"
```

不要提交：

```text
.env
```

到 Git。

---

# 45. Error Logging

开发环境：

```text
console.error
```

生产环境应该可以替换为：

```text
Sentry
```

第一阶段不强制接入。

---

# 46. 不要做的事情

第一阶段禁止：

```text
不要引入 Redux
不要引入微服务
不要创建独立 Node Backend
不要创建 GraphQL
不要创建 Redis
不要创建 Docker Kubernetes
不要实现 Shopify App
不要实现支付
不要实现 ERP
不要实现复杂权限
```

目标是：

```text
Next.js
+
PostgreSQL
+
Configurator
```

先把核心业务链路跑通。

---

# 47. 推荐项目目录

```text
glass-door-configurator/

├── app/
│   ├── page.tsx
│   │
│   ├── configurator/
│   │   └── page.tsx
│   │
│   ├── configuration/
│   │   ├── result/
│   │   │   └── page.tsx
│   │   └── bom/
│   │       └── page.tsx
│   │
│   ├── quote/
│   │   └── page.tsx
│   │
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── products/
│   │   ├── rules/
│   │   └── quotes/
│   │
│   └── api/
│       ├── configurator/
│       └── quotes/
│
├── components/
│   ├── configurator/
│   │   ├── configurator-form.tsx
│   │   ├── door-preview.tsx
│   │   ├── calculation-summary.tsx
│   │   ├── hardware-list.tsx
│   │   └── hardware-card.tsx
│   │
│   ├── bom/
│   └── ui/
│
├── src/
│   ├── domain/
│   │   └── configurator/
│   │       ├── calculator.ts
│   │       ├── rule-engine.ts
│   │       ├── quantity-engine.ts
│   │       ├── compatibility.ts
│   │       └── bom.ts
│   │
│   ├── application/
│   │   └── configurator/
│   │       └── recommend-service.ts
│   │
│   ├── infrastructure/
│   │   └── db/
│   │       ├── client.ts
│   │       └── repositories/
│   │
│   └── types/
│
├── sql/
│   └── glass_swing_door_configurator.sql
│
├── docs/
│   └── DATABASE_ISSUES.md
│
├── public/
│
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

# 48. 开发阶段

严格按照以下顺序：

## Phase 1 — Database

```text
读取 SQL
连接 PostgreSQL
验证表结构
验证数据
执行测试 SQL
```

完成后：

```text
Database ready
```

---

## Phase 2 — Project Setup

建立：

```text
Next.js
TypeScript
Tailwind
shadcn/ui
```

完成：

```text
npm run dev
```

能够启动。

---

## Phase 3 — Database Layer

实现：

```text
db/client.ts

repositories/
```

能够：

```text
读取 Product Family
读取 Attributes
读取 SKU
读取 Rules
读取 Rule Conditions
读取 Rule Items
```

---

## Phase 4 — Domain Logic

实现：

```text
calculator.ts
rule-engine.ts
quantity-engine.ts
compatibility.ts
bom.ts
```

必须写 Unit Tests。

---

## Phase 5 — API

实现：

```text
/api/configurator/recommend
```

先让 API 跑通。

---

## Phase 6 — Configurator UI

实现：

```text
Door Type
Glass Thickness
Width
Height
Opening
Mounting
Finish
```

---

## Phase 7 — Recommendation UI

实现：

```text
Calculation
Rule
Hardware
Why Recommended
```

---

## Phase 8 — BOM

实现：

```text
BOM
Subtotal
Download CSV
```

PDF 可以第二阶段做。

---

## Phase 9 — Quote

实现：

```text
Request Quote
Save Quote
Quote Detail
```

---

## Phase 10 — Admin

实现：

```text
Dashboard
Products
Rules
Quotes
```

---

# 49. 每完成一个阶段必须自测

执行：

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

如果 package.json 中还没有对应 script，先补充。

不要带着 TypeScript Error 进入下一阶段。

---

# 50. Definition of Done

项目完成必须满足：

### Database

```text
PostgreSQL 正常运行
SQL 数据正常
```

### Configurator

用户可以：

```text
选择 Door Type
选择 Glass Thickness
输入 Width
输入 Height
选择 Opening
选择 Mounting
选择 Finish
```

### Calculation

系统能够：

```text
计算面积
计算玻璃重量
判断尺寸
```

### Recommendation

系统能够：

```text
匹配 Rule
返回 Hardware
计算 Quantity
检查 Compatibility
```

### BOM

系统能够：

```text
生成 BOM
计算数量
计算单价
计算总价
```

### Quote

用户能够：

```text
填写公司信息
提交 Quote
查看 Quote
```

### Admin

管理员能够：

```text
查看 Products
查看 Rules
查看 Quotes
```

### Quality

必须：

```text
TypeScript 无错误
Lint 无错误
Build 成功
核心 Unit Test 通过
无数据库密码泄露
无浏览器端数据库连接
```

---

# 51. Claude Code 工作规则

开发过程中必须遵守：

1. 先阅读现有代码，不要直接重构。
2. 先检查 `glass_swing_door_configurator.sql`。
3. 不要删除已有 SQL 数据。
4. 不要擅自修改数据库核心表结构。
5. 新增数据库结构必须创建 migration。
6. 数据库访问必须集中在 repository。
7. 业务计算必须放在 domain。
8. React Component 不直接执行 SQL。
9. API Route 不承担复杂业务逻辑。
10. 所有外部输入必须使用 Zod 校验。
11. 所有金额使用 Decimal/整数最小货币单位，避免 JS 浮点误差。
12. 不要硬编码 SKU 推荐关系。
13. 不要用大量 if/else 替代数据库 Rule。
14. 所有推荐结果必须可以解释原因。
15. 不确定时优先保持架构简单。
16. 不为了“企业级”而过度工程化。

---

# 52. 最终核心业务链路

最终必须实现：

```text
                  Customer
                     │
                     ▼
            Configurator UI
                     │
                     ▼
             Door Configuration
                     │
                     ▼
                Zod Validate
                     │
                     ▼
              Next.js API
                     │
                     ▼
             Recommendation
                  Service
                     │
            ┌────────┴────────┐
            ▼                 ▼
        PostgreSQL        Calculator
            │                 │
            ▼                 ▼
          Rules          Glass Weight
            │                 │
            └────────┬────────┘
                     ▼
             Compatibility
                     │
                     ▼
             Hardware Package
                     │
                     ▼
                  BOM
                     │
                     ▼
              Estimated Price
                     │
              ┌──────┴──────┐
              ▼             ▼
          Download       Request Quote
```

---

# 53. 最终产品体验

用户最终应该完成这样一次完整流程：

```text
1. Open website

        ↓

2. Start Configuration

        ↓

3. Single Door

        ↓

4. 10mm Glass

        ↓

5. Width 900mm

        ↓

6. Height 2100mm

        ↓

7. Glass-to-Glass

        ↓

8. Black Finish

        ↓

9. System calculates

Area:
1.89m²

Estimated Weight:
47.25kg

        ↓

10. System recommends

2 × Heavy Duty Hinge
1 × 600mm Handle
1 × Glass Lock
2 × PVC Seal

        ↓

11. User sees

Why Recommended

        ↓

12. BOM

Hardware Total:
$XXX

        ↓

13. Request Quote

Company
Name
Email
Phone
Project
Quantity
Notes

        ↓

14. Submit
```

---

# 54. 未来扩展

当前 MVP 完成以后，再考虑：

```text
Phase 2

Shower Door
Sliding Door
Pivot Door
```

然后：

```text
Phase 3

Customer Account
Saved Configuration
Project Management
Quote Management
```

然后：

```text
Phase 4

ERP Integration
Inventory
Real-time Price
Production BOM
```

最后：

```text
Phase 5

Shopify Integration

Shopify Product
        ↓
Configurator
        ↓
Configuration
        ↓
BOM
        ↓
Cart
        ↓
Checkout
```

不要在 MVP 阶段提前实现这些功能。

---

# 55. Claude Code 执行方式

Claude Code 启动后：

第一步：

```text
阅读本 PROMPT.md
阅读 glass_swing_door_configurator.sql
检查当前项目结构
检查 PostgreSQL 连接
```

第二步：

```text
不要立即编写大量代码。

先输出：
1. 当前项目结构分析
2. SQL 数据库结构分析
3. 推荐规则结构分析
4. 实现计划
5. 发现的问题
```

然后按照：

```text
Phase 1
→ Phase 2
→ Phase 3
→ ...
```

逐阶段实现。

每个 Phase 完成后：

```text
运行测试
修复错误
确认通过
再进入下一 Phase
```

最终必须：

```text
npm run lint
npm run typecheck
npm run test
npm run build
```

全部成功。

---

# 56. 最终目标

不要把这个项目做成：

```text
CRUD Database Admin
```

而要做成：

```text
真正可使用的 B2B Glass Door Hardware Configurator
```

核心价值：

```text
Configuration
+
Engineering Calculation
+
Hardware Recommendation
+
Compatibility
+
BOM
+
Pricing
+
Quote
```

第一阶段只做好：

```text
Glass Swing Door
```

但是架构必须可以自然扩展：

```text
Glass Swing Door
        │
        ├── Shower Door
        ├── Sliding Door
        ├── Pivot Door
        ├── Office Glass Door
        └── Commercial Glass Door
```

最终成为：

```text
Glass Door Hardware Product Configurator Platform
```
