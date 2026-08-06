# PROMPT.md

你是一名资深 Next.js 全栈工程师，请帮我开发一个 Product Configurator API Demo 项目，用于验证是否可以为 Shopify 提供产品配置服务。

## 技术要求

* Next.js 16.2.12（App Router）
* TypeScript
* PostgreSQL（使用自建 PostgreSQL 服务器）
* Prisma ORM
* REST API
* Zod（API 参数校验）

## 项目目标

开发一个纯后端 API 服务，不需要任何前端页面。

用于验证：

* Next.js 是否适合作为 API 服务。
* PostgreSQL 是否能够存储 Product Configurator 数据。
* Shopify 是否能够调用 API 获取产品配置数据。
* 产品选项和价格计算是否正常工作。

---

## 数据模型

创建以下数据表：

### Product

* id
* title
* description
* basePrice

### ProductOption

例如：

* Color
* Size
* Material

字段：

* id
* productId
* name

### ProductOptionValue

例如：

Color：

* Black
* White

字段：

* id
* optionId
* value
* extraPrice

### ProductVariant

字段：

* id
* productId
* sku
* price
* stock
* optionCombination（JSON）

---

## API 接口

### 获取产品信息

GET

/api/products/:id

### 获取产品配置项

GET

/api/configurator/:id

返回示例：

```json
{
  "success": true,
  "data": {
    "options": [
      {
        "name": "Color",
        "values": ["Black", "White"]
      },
      {
        "name": "Size",
        "values": ["M", "L"]
      }
    ]
  }
}
```

---

### 获取产品 Variant

GET

```text
/api/products/:id/variants
```

---

### 根据用户配置计算价格

POST

```text
/api/configurator/price
```

请求：

```json
{
  "productId": 1,
  "options": {
    "Color": "Black",
    "Size": "L"
  }
}
```

返回：

```json
{
  "success": true,
  "data": {
    "price": 299,
    "sku": "SKU-001",
    "stock": 50
  }
}
```

---

## Seed Data

创建一个测试产品：

```text
Custom Product
```

配置项：

```text
Color
- Black
- White

Size
- M
- L
```

Variant：

```text
Black + M
Black + L
White + M
White + L
```

用于 API 测试。

---

## 开发要求

请完成：

1. Prisma Schema。
2. PostgreSQL 数据库配置。
3. Migration。
4. Seed 数据。
5. REST API 开发。
6. API 错误处理。
7. curl 测试命令。
8. 完整项目目录结构。

---

## 最终要求

运行：

```bash
npm run dev
```

能够正常访问：

```text
http://localhost:3000/api/products/1
```

并且可以测试：

* Product API
* Configurator API
* Variant API
* Price API

请优先保证代码简洁、结构清晰，并以 API 可行性验证为目标，不需要开发 Shopify App 的前端界面。
