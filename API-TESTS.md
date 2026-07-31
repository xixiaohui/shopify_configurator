# Product Configurator API — curl 测试命令

## 前置条件

1. PostgreSQL 数据库运行中
2. 设置环境变量 DATABASE_URL（见 .env）
3. 运行 migration：`pnpm db:migrate`
4. 运行 seed：`pnpm db:seed`
5. 启动 dev server：`pnpm dev`

---

## 1. 获取产品信息

```bash
curl -s http://localhost:3000/api/products/1 | jq
```

期望返回产品及其所有关联数据（options, values, variants）。

---

## 2. 获取产品配置项

```bash
curl -s http://localhost:3000/api/configurator/1 | jq
```

期望返回：

```json
{
  "success": true,
  "data": {
    "options": [
      { "name": "Color", "values": ["Black", "White"] },
      { "name": "Size", "values": ["M", "L"] }
    ]
  }
}
```

---

## 3. 获取产品 Variants

```bash
curl -s http://localhost:3000/api/products/1/variants | jq
```

期望返回 4 个 variant（Black+M、Black+L、White+M、White+L）。
其中 `SKU-BLK-M` 的 `recommendations` 字段包含示例推荐数据，其余 variant 的 `recommendations` 为 `null`。

---

## 4. 根据配置计算价格

### Black + M（无额外费用，basePrice=199）

```bash
curl -s -X POST http://localhost:3000/api/configurator/price \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "options": {"Color": "Black", "Size": "M"}}' | jq
```

期望：

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

### White + L（White +10, L +20, basePrice=199 → 229）

```bash
curl -s -X POST http://localhost:3000/api/configurator/price \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "options": {"Color": "White", "Size": "L"}}' | jq
```

期望：

```json
{
  "success": true,
  "data": {
    "price": 229,
    "sku": "SKU-WHT-L",
    "stock": 50,
    "recommendations": null
  }
}
```

### Black + L（Black +0, L +20, basePrice=199 → 219）

```bash
curl -s -X POST http://localhost:3000/api/configurator/price \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "options": {"Color": "Black", "Size": "L"}}' | jq
```

期望：

```json
{
  "success": true,
  "data": {
    "price": 219,
    "sku": "SKU-BLK-L",
    "stock": 50,
    "recommendations": null
  }
}
```

### White + M（White +10, M +0, basePrice=199 → 209）

```bash
curl -s -X POST http://localhost:3000/api/configurator/price \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "options": {"Color": "White", "Size": "M"}}' | jq
```

期望：

```json
{
  "success": true,
  "data": {
    "price": 209,
    "sku": "SKU-WHT-M",
    "stock": 50,
    "recommendations": null
  }
}
```

---

## 5. 错误处理测试

### 无效的产品 ID

```bash
curl -s http://localhost:3000/api/products/999 | jq
```

期望：`{ "success": false, "error": "Product not found" }`

### 无效的请求参数

```bash
curl -s -X POST http://localhost:3000/api/configurator/price \
  -H "Content-Type: application/json" \
  -d '{"productId": "abc"}' | jq
```

期望：`{ "success": false, "error": "Invalid request body" }`

### 不存在的配置项

```bash
curl -s -X POST http://localhost:3000/api/configurator/price \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "options": {"Color": "Red", "Size": "M"}}' | jq
```

期望：`{ "success": false, "error": "Value \"Red\" not found for option \"Color\"" }`
