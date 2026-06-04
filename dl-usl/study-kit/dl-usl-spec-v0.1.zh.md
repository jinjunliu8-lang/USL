# DL-USL v0.1 规范整理版

DL-USL 是 USL 面向深度学习工程的学习与控制 profile。它把一个深度学习项目从“阅读大量框架代码”压缩成一份结构化规格，让人先理解系统语义，再按需深入 PyTorch、数学和底层实现。

## 1. 定位

DL-USL 不替代 PyTorch、TensorFlow 或 JAX。它位于框架之上，用来描述：

- 任务目标
- 数据来源和字段
- 输入、标签和输出张量
- 模型组件和前向传播路径
- 损失函数、优化器和训练策略
- 评估指标、检查点和导出产物
- 工程规则、失败模式、验收测试和完成标准

当前 v0.1 不新增 parser 语法，复用 USL v0.1 的顶层块。

## 2. 顶层块映射

```text
spec   -> 深度学习项目名称和版本
goal   -> 任务类型、目标框架、学习/复现/生成目标
actor  -> 人、AI Agent、训练框架、数据源、实验追踪系统
entity -> 数据集、样本、批次、张量、模型组件、loss、optimizer、metric、checkpoint、export artifact
state  -> checkpoint、export artifact、dataset、training run 等生命周期
flow   -> 数据准备、前向传播、训练步骤、评估、保存、导出
rule   -> AI 生成代码时必须遵守或禁止违反的硬规则
error  -> 稳定失败模式
test   -> 验收场景
limit  -> 允许和禁止修改的路径范围
done   -> 最终完成标准
```

## 3. 必须描述的深度学习语义

每份 DL-USL 至少应该回答这些问题：

- 这是分类、回归、检测、分割、生成、对比学习，还是自定义任务？
- 数据从哪里来，训练集、验证集、测试集如何划分？
- 原始样本有哪些字段，哪些字段是输入，哪些字段是标签？
- batch 中每个张量的 shape 和 dtype 是什么？
- 模型输入如何经过组件变成输出？
- 输出变量叫什么，shape 是否和任务匹配？
- loss 如何从输出和标签计算？
- optimizer、学习率、权重衰减、梯度裁剪、混合精度如何设置？
- 评估阶段是否关闭梯度，是否禁止 optimizer 更新？
- 指标如何计算，最佳 checkpoint 按什么指标保存？
- 是否需要导出模型，导出后如何用示例输入验证？

## 4. rule、test、done 的区别

`rule` 是硬约束。它用于约束 AI 或实现者不能违反的工程规则。

示例：

```usl
rule:
  must 明确 Batch input_tensor 和 label_tensor 的 shape
  must 记录 Loss 和 Metrics
  must not 在 Evaluation 中更新 Optimizer
  must not test_label_leakage 泄露测试集标签
```

`test` 是验收场景。它描述如何证明规则和流程被实现。

示例：

```usl
test evaluation_does_not_train:
  given Model is in eval mode
  and gradients are disabled
  when TrainingAgent runs Evaluation
  then Metrics are computed
  and Optimizer is not updated
```

`done` 是最终交付标准。它不只是“代码生成完成”，而是声明哪些产物和验证必须存在。

示例：

```usl
done:
  数据加载和 batch shape 检查通过
  ForwardPass 输出 shape 正确
  Evaluation 不反向传播也不更新 Optimizer
  ExportArtifact 已用示例输入验证
```

## 5. 推荐实体

常用实体包括：

- `Dataset`: 路径、字段、切分、类别数、标签空间。
- `Sample`: 单条样本的原始字段。
- `Batch`: 输入张量、标签张量、mask、shape、dtype。
- `Tokenizer` 或 `Preprocessor`: 文本、图像、音频或表格的预处理规则。
- `Model`: 总体架构、骨干网络、关键超参数。
- `ForwardGraph`: 输入到输出的计算路径。
- `Prediction` 或 `Logits`: 模型输出。
- `Loss`: 损失类型、输入和目标。
- `Optimizer`: 优化器、学习率、权重衰减、梯度裁剪。
- `Trainer`: epoch、batch size、seed、混合精度、早停。
- `Metrics`: 训练、验证、测试指标。
- `Checkpoint`: 保存路径、监控指标、生命周期。
- `ExportArtifact`: 导出格式、示例输入、验证状态。

## 6. 推荐流程

至少定义这些 flow：

- `PrepareData`: 原始数据如何变成 batch。
- `ForwardPass`: batch 如何经过 model 得到 prediction。
- `TrainingStep`: loss、反向传播、梯度裁剪、optimizer 更新和日志。
- `Evaluation`: eval mode、no grad、指标计算、禁止更新 optimizer。
- `SaveBestCheckpoint`: 按验证指标保存最佳模型。
- `ExportModel`: 导出模型并用示例输入验证输出。

## 7. 当前限制

DL-USL v0.1 的 shape、dtype 和规则仍是结构化文本。当前 CLI 可以检查块、引用、错误码和规则测试关联，但不会真正计算张量形状。

因此第一版重点是学习和控制 AI 生成行为。后续可以扩展专用 DL-USL parser，支持：

- 符号化 shape 推导，例如 `[B, S, D]`
- `hidden_size % attention_heads == 0` 静态检查
- `attention_mask.shape == token_ids.shape` 检查
- eval flow 中禁止出现 backward 或 optimizer step
- 导出格式和示例输入输出的结构化验证

## 8. 判断标准

一份合格的 DL-USL 不是模型摘要，而是深度学习工程规格。它必须让读者看完后能说清楚：

- 这个项目在学什么任务。
- 数据如何进入模型。
- 张量如何流动。
- 模型输出如何变成 loss。
- 训练和评估如何避免常见错误。
- 什么状态才算项目可复现、可评估、可导出。

