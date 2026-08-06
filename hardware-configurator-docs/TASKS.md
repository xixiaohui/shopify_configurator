# TASKS.md

## T001 Foundation
建立 Next.js 16 + TypeScript + Tailwind + shadcn/ui。
验收：dev/lint/typecheck 正常。

## T002 Database
将 glass_swing_door_configurator.sql 转为正式 migrations/seed。
验收：schema 可从零创建，seed 可重复运行。

## T003 Domain Types
建立 ConfigurationInput、DerivedValues、Recommendation、BomItem。

## T004 Validation
Zod 完成所有输入验证。

## T005 Calculator
实现面积、重量、尺寸分类。

## T006 Rule Engine
实现条件、优先级、有效期、active。

## T007 Compatibility
实现 SKU 兼容性。

## T008 Quantity
实现固定数量和重量/尺寸数量。

## T009 BOM
生成 BOM 与价格。

## T010 Preview API
POST /api/v1/configurations/preview。

## T011 Configurator UI
实现五步配置器。

## T012 Result UI
推荐、解释、BOM、价格。

## T013 Save
保存配置 snapshot。

## T014 Quote
Request Quote。

## T015 Admin Products
SKU CRUD。

## T016 Admin Rules
Rule CRUD + Condition Builder。

## T017 Tests
unit + integration + E2E。

## T018 Production
部署、日志、错误处理、rate limit、backup。

每个任务完成后更新 TASKS.md，并运行 lint、typecheck、test、build。
