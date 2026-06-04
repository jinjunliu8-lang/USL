# DL-USL Study Kit

这套资料用于把任意深度学习代码仓库逆向整理成 DL-USL。它的目标不是替代 PyTorch、TensorFlow 或 JAX，而是让你先得到一份可读、可检查、可复用的规格。

核心工作流：

```text
拉取深度学习项目代码
  -> 让 AI 逆向分析代码结构
  -> 生成兼容 USL v0.1 的 DL-USL 文件
  -> 用 DL-USL 学习任务、数据、张量、模型、训练和评估
  -> 按需要让 AI 基于 DL-USL 改写、复现或重建项目
```

## Files

- `dl-usl-spec-v0.1.zh.md`: DL-USL v0.1 正式整理版，说明块结构、规则、检查和完成标准。
- `repo-to-dl-usl-workflow.zh.md`: 从代码仓库逆向生成 DL-USL 的学习流程。
- `templates/repo-to-dl-usl-prompt.md`: 可直接发给 AI 的逆向分析提示词。
- `templates/dl-usl-project.usl`: 兼容当前 CLI 的空白 DL-USL 项目模板。
- `templates/dl-usl-review-checklist.zh.md`: 审查 AI 生成的 DL-USL 是否完整的清单。

## Recommended Use

1. 先读 `dl-usl-spec-v0.1.zh.md`，理解 DL-USL 应该描述哪些深度学习语义。
2. 拉取你想学习的深度学习项目。
3. 把 `templates/repo-to-dl-usl-prompt.md` 发给 AI，并附上项目目录、关键源码或仓库路径。
4. 要求 AI 输出一个 `.usl` 文件，且必须兼容 USL v0.1 顶层块。
5. 用 `templates/dl-usl-review-checklist.zh.md` 检查输出是否遗漏关键内容。
6. 如果仓库在本项目中，可以运行：

```bash
npm run usl -- check dl-usl/study-kit/templates/dl-usl-project.usl
npm run usl -- gen-prompt dl-usl/study-kit/templates/dl-usl-project.usl
```

## Authoring Rule

第一版 DL-USL Study Kit 坚持兼容当前 USL v0.1 parser。顶层块只使用：

```text
spec, goal, actor, entity, state, flow, rule, error, test, limit, done
```

中文可以写在块内容里，但不要把 `规格`、`任务`、`输入`、`模型`、`前向` 作为顶层块。那些词可以作为解释性概念存在，不能作为当前 CLI 的语法入口。

