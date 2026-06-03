# USL v0.1

USL: Universal Semantic Language, a semantic source language for the AI programming era.

USL is not a universal code translator. It is a higher-level source language for describing software semantics before implementation: goals, entities, states, flows, rules, tests, constraints, and completion criteria.

USL 不是万能代码翻译器，而是一门面向 AI 编程时代的通用软件语义源语言。它让人先描述系统要做什么、有哪些对象、状态如何变化、必须遵守哪些规则、怎样测试和验收，再由 AI Agent 或目标语言工具链生成实现。

```bash
npm install
npm run usl -- check examples/email_login.usl
npm run usl -- check examples/order_payment.usl
npm run usl -- gen-prompt examples/email_login.usl
```

Docs:

- Chinese: `docs/usl-v0.1.zh.md`
- English: `docs/usl-v0.1.en.md`
- Order payment case study: `docs/case-study-order-payment.zh.md`
- Compatibility entry: `docs/usl-v0.1.md`

## License

MIT
