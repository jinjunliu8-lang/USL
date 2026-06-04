# DL-USL v0.1 中文说明

DL-USL 是 USL 面向深度学习任务的 profile。它的目标不是让用户学习 PyTorch、TensorFlow、JAX、训练循环、张量 API 和模型导出细节，而是让用户能控制 AI 生成深度学习工程时的关键行为。

一句话：

> DL-USL 让深度学习任务从“帮我训个模型”的模糊需求，变成有数据、有张量、有训练规则、有评估验收的 AI 编程控制规格。

## 要解决的问题

普通 vibe coding 里，用户可能会说：

```text
帮我做一个文本分类模型。
```

AI 可能会直接生成代码，但用户很难控制：

- 数据字段是不是读对了。
- 标签数量是不是正确。
- padding 有没有被 mask 掉。
- 训练集、验证集、测试集有没有泄露。
- loss 是不是 NaN。
- 验证阶段有没有反向传播。
- 指标是不是和任务匹配。
- 最佳模型是不是按验证指标保存。
- 导出的模型是否真的能推理。

DL-USL 把这些风险写成 `entity`、`flow`、`rule`、`test` 和 `done`，让 AI 不能只凭默认习惯生成训练脚本。

## DL-USL 控制什么

深度学习任务最需要控制的不是每一行框架代码，而是这些语义：

```text
任务类型
数据来源和字段
输入输出张量
模型结构边界
前向传播路径
损失函数
优化器和学习率
训练策略
评估指标
检查点保存
模型导出
复现实验要求
失败条件和验收标准
```

## 和 USL v0.1 的映射

DL-USL 不新增 parser 语法。它复用当前 USL v0.1 的顶层块：

```text
goal   -> 深度学习任务目标
actor  -> 用户、AI Agent、训练框架、实验追踪系统
entity -> 数据集、样本、批次、张量、模型、loss、optimizer、metric、checkpoint、export artifact
state  -> checkpoint、artifact、dataset 或训练任务状态
flow   -> 数据准备、forward、training step、evaluation、checkpoint、export
rule   -> AI 绝不能违反的训练规则
error  -> 稳定失败模式
test   -> 生成工程必须满足的验收测试
limit  -> AI 可以改和不能改的文件范围
done   -> 训练工程完成标准
```

## 推荐结构

一个 DL-USL 文件建议按这个顺序写：

```usl
spec MyDeepLearningTask v0.1:

goal:
  写清楚任务类型、目标框架、训练产物和验收目标。

actor:
  写用户、AI Agent、训练框架、实验追踪系统。

entity Dataset:
  写数据路径、字段、类别数、切分方式。

entity Batch:
  写输入张量、label、shape、dtype。

entity Model:
  写模型结构边界，不需要写每一行代码。

entity Loss:
  写 loss 类型和输入输出。

entity Optimizer:
  写优化器、学习率、权重衰减、梯度裁剪。

flow PrepareData:
  写数据如何变成 batch。

flow ForwardPass:
  写输入如何得到输出。

flow TrainingStep:
  写 loss、反向传播、优化器更新、日志。

flow Evaluation:
  写验证逻辑，明确不反向传播、不更新 optimizer。

flow ExportModel:
  写导出格式和导出后检查。

rule:
  写训练、验证、数据、导出的硬规则。

test:
  写可验收场景。

done:
  写最终交付标准。
```

## 第一版必须表达的规则

建议每个 DL-USL 至少有这些规则：

- `must` 明确输入张量 shape。
- `must` 明确输出张量 shape。
- `must` 明确 loss 类型和目标。
- `must` 记录训练 loss 和验证 metrics。
- `must not` 在验证集上反向传播。
- `must not` 在验证阶段更新 optimizer。
- `must not` 泄露测试集标签。
- `must` 导出模型后验证示例输入输出。

## 完成标准示例

`done` 不应该只写“代码完成”，而应该写：

```text
数据加载和 batch shape 检查通过
ForwardPass 输出 shape 正确
TrainingStep 会计算 loss 并更新 optimizer
Evaluation 不反向传播也不更新 optimizer
Metrics 已记录
最佳 checkpoint 已保存
导出产物已用示例输入验证
```

## 当前限制

DL-USL v0.1 仍然复用通用 USL parser，所以张量 shape、dtype、设备、分布式训练和导出格式目前主要是结构化文本，checker 还不会真正理解它们的数学关系。

后续可以扩展专用检查，例如：

- `hidden_size % attention_heads == 0`
- `logits.shape[-1] == class_count`
- `attention_mask.shape == token_ids.shape`
- `eval` flow 不能包含 optimizer update
- `export` 必须包含示例输入和输出 shape 验证

## 一句话总结

DL-USL 的价值不是替代深度学习框架，而是让用户在不深入学习框架细节的情况下，控制 AI 生成训练工程的目标、边界、规则和验收。
