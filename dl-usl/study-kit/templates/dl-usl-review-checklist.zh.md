# DL-USL 输出审查清单

用这份清单检查 AI 从深度学习仓库生成的 DL-USL 是否完整。目标是发现遗漏和幻觉，不是润色文字。

## 1. 仓库入口

- 是否写明项目框架：PyTorch、TensorFlow、JAX 或其他？
- 是否写明训练入口：脚本、命令或配置？
- 是否写明评估、推理或导出入口？
- 如果入口不存在，是否明确写“未发现”？

## 2. 数据和张量

- 是否声明训练集、验证集、测试集来源？
- 是否声明样本字段：输入、标签、辅助字段？
- 是否声明 batch 中的输入张量、标签张量、mask 张量？
- 是否写明 shape 和 dtype？
- 序列任务是否写明 padding 和 attention mask？
- 图像任务是否写明通道顺序、尺寸、归一化？
- 生成任务是否写明 input_ids、labels、causal mask 或 shift 规则？

## 3. 模型和前向传播

- 是否声明模型架构和关键组件？
- 是否能从 `ForwardPass` 看出输入如何变成输出？
- 是否声明输出变量名称，例如 logits、prediction、hidden_states？
- 输出 shape 是否和任务类型匹配？
- 多模态、残差、拼接、池化、flatten、reshape 是否被写清楚？

## 4. Loss、Optimizer 和 Trainer

- 是否声明 loss 类型？
- 是否说明 loss 的输入和目标？
- 是否声明 optimizer、学习率、权重衰减？
- 是否声明 scheduler、梯度裁剪、混合精度、分布式训练状态？
- 是否声明 epoch、batch size、seed？
- 如果这些由配置文件提供，是否写出配置来源？

## 5. Evaluation、Metrics 和 Checkpoint

- 是否明确 eval mode？
- 是否明确禁用 gradients？
- 是否明确 Evaluation 不更新 Optimizer？
- 是否写明训练、验证、测试指标？
- 是否写明最佳 checkpoint 的监控指标？
- 是否写明 checkpoint 路径或保存规则？
- 是否避免使用测试集指标做训练选择或早停？

## 6. Export 或 Inference

- 是否声明导出格式：ONNX、TorchScript、SavedModel、TensorRT 或未发现？
- 如果没有导出，是否至少说明 inference 路径？
- 是否声明示例输入 shape？
- 是否声明导出或推理输出 shape 验证？

## 7. rule、error、test、done

- 每条关键训练风险是否进入 `rule`？
- 每条关键 `rule` 是否有相关 `test`？
- 是否声明稳定错误码，例如 DATASET_INVALID、FORWARD_INVALID、TRAINING_INVALID、EVALUATION_INVALID？
- `done` 是否是可验收交付标准，而不是“写完代码”？
- 是否明确未发现的信息，不让 AI 编造？

## 8. 最终判断

合格的 DL-USL 应该让你不读源码也能先说清：

- 项目任务是什么。
- 数据如何进入 batch。
- batch 如何经过模型得到输出。
- 输出如何计算 loss。
- 训练如何更新参数。
- 验证如何避免训练行为。
- checkpoint 和导出如何判断有效。
- 哪些地方最容易出错，如何测试。

如果以上任何一项说不清，要求 AI 回到源码补充，而不是凭经验猜测。

