# DL-USL

DL-USL is a deep-learning profile of USL. It uses the current USL v0.1 syntax to control AI-generated deep learning work without requiring the user to learn every PyTorch, TensorFlow, JAX, training-loop, export, and evaluation detail first.

The problem is similar to ordinary vibe coding: if the user only says "train a Transformer classifier", the AI may choose hidden assumptions, skip masking, leak validation behavior into training, forget export checks, or produce code that is hard to verify. DL-USL turns the task into a control spec.

```text
Human writes DL-USL control spec
  -> AI agent reads task, data, tensors, rules, tests, and done criteria
  -> target framework code is generated
  -> training script, checks, metrics, logs, and export config are produced
  -> user verifies the result without reading every framework detail first
```

## Mapping To USL v0.1

Current USL only requires a small set of top-level blocks. DL-USL reuses them this way:

```text
spec   -> deep learning project name and version
goal   -> task objective, target runtime, reproducibility goal
actor  -> human, framework, data source, training platform
entity -> dataset, tensor, model part, loss, optimizer, metric, checkpoint, export artifact
state  -> lifecycle of model runs, checkpoints, datasets, and exports
flow   -> data preparation, model forward, training step, evaluation, checkpointing, export
rule   -> training and evaluation rules the AI must not violate
error  -> stable failure modes
test   -> acceptance checks for generated implementation
limit  -> files the agent may or must not modify
done   -> completion criteria
```

## What DL-USL Controls

- Data sources and required fields.
- Tensor shapes, dtypes, padding, masks, and labels.
- Model architecture choices that matter to correctness.
- Training behavior such as loss, optimizer, gradient clipping, and mixed precision.
- Evaluation behavior such as no backward pass and no optimizer updates.
- Metrics, checkpointing, logging, and export artifacts.
- Rules and tests that prove the generated training code is acceptable.

## Files

- `dl-usl-v0.1.zh.md`: DL-USL 中文设计说明，解释深度学习任务应该如何被 USL 控制。
- `study-kit/`: 深度学习项目逆向学习资料包，用于把任意代码仓库整理成兼容 USL v0.1 的 DL-USL。
- `deep_learning_training_pipeline.usl`: 通用深度学习训练流水线 starter，可作为新任务模板改写。
- `transformer_text_classification.usl`: Transformer text classification training spec.
- `cnn_image_classification.usl`: CNN image classification training spec.

## Check

Run from the repository root:

```bash
npm run usl -- check dl-usl/deep_learning_training_pipeline.usl
npm run usl -- check dl-usl/transformer_text_classification.usl
npm run usl -- check dl-usl/cnn_image_classification.usl
npm run usl -- check dl-usl/study-kit/templates/dl-usl-project.usl
npm run usl -- gen-prompt dl-usl/transformer_text_classification.usl
npm run usl -- gen-prompt dl-usl/study-kit/templates/dl-usl-project.usl
```

## Authoring Rules

- Keep top-level block names in English because the current parser recognizes `spec`, `goal`, `actor`, `entity`, `state`, `flow`, `rule`, `error`, `test`, `limit`, and `done`.
- Use Chinese freely inside block bodies.
- Give important tensors and model components explicit `entity` blocks so flows, rules, and tests can refer to them.
- Put shape, dtype, masking, metric, training, evaluation, and export requirements in `rule` and `test`, not only in prose.
- Treat `done` as the contract for whether generated training code is acceptable.

## Recommended Writing Order

1. Write the task goal first: classification, regression, detection, segmentation, generation, recommendation, or representation learning.
2. Define data and tensors before defining the model.
3. Define the model only at the level needed to control AI choices.
4. Define training and evaluation flows separately.
5. Turn every important training risk into `rule` and `test`.
6. Put export, reproducibility, and logging in `done`.
