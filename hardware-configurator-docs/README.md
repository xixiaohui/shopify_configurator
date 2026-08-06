# Hardware Configurator — Claude Code Enterprise Docs

这是 Glass Swing Door B2B Product Configurator 的开发规格。

## 文件
- PROMPT.md：Claude Code 总指令
- PRODUCT.md：产品需求
- DATABASE.md：数据库模型
- API.md：API 规范
- RULE_ENGINE.md：推荐规则引擎
- UI.md：前端规范
- ROADMAP.md：路线图
- TASKS.md：任务清单
- CODING_RULES.md：编码规范

## 使用
将 docs 目录放入项目根目录，并把 glass_swing_door_configurator.sql 作为 seed/reference。

Claude Code 执行顺序：
1. 阅读全部 docs
2. 检查现有项目
3. 从 T001 开始
4. 每个任务完成后测试
5. 更新 TASKS.md
6. 最终运行 lint、typecheck、test、build

## MVP 完成定义
用户能够：配置 Glass Swing Door → 匹配规则 → 推荐五金 SKU → 查看推荐原因 → 生成 BOM → 计算价格 → 提交 Quote。
