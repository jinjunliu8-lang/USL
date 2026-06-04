# USL v0.1

USL is a control language for AI coding.

USL 用结构化的目标、规则、边界、测试和完成标准控制 AI 编程过程。它解决的不是“让人再学一门编程语言”，而是让人不用深入学习 Python、TypeScript、PyTorch、Web 框架或工程细节，也能说清楚 AI 应该做什么、不能做什么、怎样验证、什么时候算完成。

Vibe coding 的问题是需求散在聊天里，AI 改了什么、为什么这么改、有没有越界，用户很难把握。USL 把这件事变成一份可解析、可检查、可交给 Agent 执行的规格。

```text
人写 USL 控制规格
  -> USL CLI 检查规则、边界和验收
  -> USL CLI 生成 Agent 执行提示
  -> AI Agent 按规格实现代码和测试
  -> 人用测试和 done 标准确认完成
```

## Core Blocks

- `goal`: 说明要做什么。
- `rule`: 说明必须遵守什么、绝不能做什么。
- `test`: 说明怎样验证 AI 做对了。
- `limit`: 说明 AI 可以改哪里、不能改哪里。
- `done`: 说明什么状态才算完成。

`actor`、`entity`、`state`、`flow`、`error` 用来补充参与者、对象、状态、流程和稳定错误，让 AI 不只拿到一句需求，而是拿到完整的工程控制面。

## Quick Start

```bash
npm install
npm run usl -- check examples/email_login.usl
npm run usl -- check examples/order_payment.usl
npm run usl -- check examples/order_payment.zh.usl
npm run usl -- check dl-usl/transformer_text_classification.usl
npm run usl -- gen-prompt examples/email_login.usl
```

## Docs

- Language overview Chinese: `docs/usl-language.zh.md`
- Language overview English: `docs/usl-language.en.md`
- Chinese spec: `docs/usl-v0.1.zh.md`
- English spec: `docs/usl-v0.1.en.md`
- USL intermediary language Chinese: `docs/usl-intermediary-language.zh.md`
- Order payment case study: `docs/case-study-order-payment.zh.md`
- Pure Chinese order payment reading version: `docs/order-payment-pure-zh.md`
- Deep learning profile: `dl-usl/README.md`
- Compatibility entry: `docs/usl-v0.1.md`

## License

MIT
