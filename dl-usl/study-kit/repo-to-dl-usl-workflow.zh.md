# 从深度学习仓库逆向生成 DL-USL 的流程

这个流程用于学习任何深度学习项目。目标不是一开始读懂每一行代码，而是先把仓库逆向成一份 DL-USL 规格，建立系统视角。

## 1. 准备代码仓库

拉取项目后，先收集这些信息：

- 目录结构
- README 或训练命令
- 配置文件
- dataset / dataloader / transform 相关源码
- model / module / network 相关源码
- train / trainer / loop 相关源码
- eval / metrics / inference / export 相关源码

如果项目很大，不要一次把所有文件发给 AI。先发目录结构和 README，让 AI 判断关键文件，再分批补充源码。

## 2. 让 AI 做第一轮逆向

使用 `templates/repo-to-dl-usl-prompt.md`。第一轮目标只要求 AI 识别：

- 任务类型
- 框架和运行方式
- 数据入口
- 模型入口
- 训练入口
- 评估入口
- 配置来源

第一轮不要急着让 AI 改代码。只让它输出仓库理解和待确认点。

## 3. 生成 DL-USL

确认关键文件后，让 AI 输出一个兼容 USL v0.1 的 `.usl` 文件。

输出必须包括：

- `spec`
- `goal`
- `actor`
- `entity`
- `state`
- `flow`
- `rule`
- `error`
- `test`
- `limit`
- `done`

如果项目没有导出逻辑，也要在 `done` 或 `rule` 中明确“当前项目未发现导出流程”，不能让 AI 假装已有导出。

## 4. 人工审查

用 `templates/dl-usl-review-checklist.zh.md` 检查 AI 输出。重点看它是否遗漏：

- 数据字段
- batch shape
- label shape
- mask 或 padding
- forward 输出
- loss 输入和目标
- eval 是否 no grad
- checkpoint 监控指标
- export 或 inference 验证

发现遗漏后，让 AI 基于源码补充，不要让它凭经验编造。

## 5. 用 DL-USL 学习项目

拿到 DL-USL 后，按这个顺序学习：

1. 看 `goal`，理解任务。
2. 看 `Dataset`、`Sample`、`Batch`，理解数据如何进入模型。
3. 看 `Model` 和 `ForwardPass`，理解张量如何流动。
4. 看 `Loss`、`Optimizer`、`TrainingStep`，理解训练目标和更新方式。
5. 看 `Evaluation`、`Metrics`、`Checkpoint`，理解如何判断训练效果。
6. 看 `rule`、`test`、`done`，理解这个项目最容易犯什么工程错误。

## 6. 后续使用

DL-USL 可以继续用于三类任务：

- 学习：让 AI 按 DL-USL 解释模型、张量和训练流程。
- 复现：让 AI 按 DL-USL 重新生成一个最小可运行工程。
- 改写：先修改 DL-USL 中的模型、数据、loss 或规则，再让 AI 生成代码变更。

## 7. 注意事项

- DL-USL 是规格，不是论文摘要。
- 不要只写模型结构，必须写数据、训练、评估和验收。
- 不要让 AI 隐式补全未在源码中发现的训练行为。
- 不要把测试集标签用于训练、调参或早停。
- 不要把验证阶段写成训练阶段。
- 不要忽略 shape、dtype、mask、device、checkpoint 和 export。

