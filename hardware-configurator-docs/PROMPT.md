# Hardware Configurator — Claude Code Master Prompt

## 项目目标
开发企业级 B2B Product Configurator，第一阶段聚焦 Glass Swing Door 五金配置。用户输入门型、玻璃厚度、尺寸、安装方式、开启方向、表面处理后，系统通过 PostgreSQL 产品、兼容性、推荐规则和 BOM 数据自动推荐五金 SKU、计算数量和价格并生成 BOM/Quote。

## 技术栈
- Next.js 16 App Router
- TypeScript strict
- Tailwind CSS + shadcn/ui + Lucide
- PostgreSQL 16+
- Prisma；复杂查询允许 parameterized raw SQL
- Zod + React Hook Form
- Vitest + Playwright
- ESLint + Prettier

## 架构原则
Browser → Next.js UI → Route Handler → Domain Service → Repository → PostgreSQL。
数据库是业务事实来源；规则不得硬编码在 React。API 输入必须 Zod 校验。SQL 必须参数化。金额使用 numeric，不使用 float。SKU 是业务唯一标识，但内部关联使用 id。

## MVP
1. Glass Swing Door
2. Single / Double
3. 8 / 10 / 12mm
4. Width / Height
5. Glass-to-Glass / Glass-to-Wall
6. Opening direction
7. SSS / PSS / Black / Gold
8. 面积、玻璃重量、重量等级
9. 推荐五金、推荐原因、数量、价格
10. BOM、保存配置、Request Quote
11. Admin：SKU、规则、配置、Quote

## 推荐流程
Configurator Input → Zod Validation → Normalize → Derived Values → Active Rules → Condition Evaluation → Priority Ranking → Rule Items → SKU Compatibility → Quantity → Price → BOM → Configuration Snapshot → API Response。

## Rule Engine
支持 EQ、NEQ、GT、GTE、LT、LTE、IN、NOT_IN、BETWEEN、RANGE、EXISTS。同一 rule 条件默认 AND。支持 priority、active、valid_from、valid_to、rule_version、explanation。禁止 eval 任意用户输入。

## Claude Code 工作方式
开始前阅读 docs 全部文件；检查现有项目；先给 implementation plan；按 TASKS.md 顺序实现；每项任务运行测试；遇到模型冲突先修数据库模型；不自行添加大范围依赖；最后运行 lint、typecheck、test、build。

## 禁止
不提交 secrets；不暴露 DB；不在客户端执行规则；不把价格写死 UI；不使用 SKU name 作为外键；不使用 float 存金额；不拼接用户 SQL；不为了快速完成删除 FK/UNIQUE/INDEX。
