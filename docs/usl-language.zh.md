# USL：通用软件语义语言

USL 是 Universal Semantic Language 的缩写，中文可以叫 **通用软件语义语言**。

它是一门面向 AI 编程时代的 **软件语义源语言**。它不试图替代 Python、Java、C++、Go 或 TypeScript，也不试图把任意一种语言的代码完整翻译成另一种语言。

USL 关注的是代码之前的东西：

```text
系统要解决什么问题？
谁会使用它？
系统里有哪些对象？
对象有哪些状态？
什么行为会改变状态？
哪些规则必须永远成立？
哪些错误必须被稳定表达？
怎样测试才算做对？
AI Agent 能改哪里，不能改哪里？
什么条件下算完成？
```

## 为什么需要 USL

软件的大部分复杂度已经不在语法，而在语义。

真正困难的往往不是写一个循环，而是说清楚：

```text
订单什么时候能取消？
支付回调能不能重复处理？
库存什么时候锁定？
用户有没有权限访问这份数据？
异常情况应该返回什么？
什么情况算功能完成？
```

这些问题和具体编程语言没有强绑定。Python、Java、C++ 可以实现它们，但它们本身不是这些业务语义的最佳第一表达层。

USL 的目标是让人先把系统语义表达清楚，再让 AI Agent 或目标语言工具链生成实现、测试、文档和接口。

## USL 不是什么

USL 不是万能代码翻译器。

它不是：

```text
Python -> Java
Java -> C++
C++ -> TypeScript
```

它更像是：

```text
USL 语义源
  -> API
  -> 数据模型
  -> 测试
  -> 文档
  -> SDK
  -> Python / Java / Go / C++ / TypeScript 实现
```

也就是说，USL 是代码生成之前的统一语义源。

## 一个简单例子

```usl
spec OrderPayment v0.1:

goal:
  让买家可以为待支付订单完成付款，并保证支付回调、库存、金额和订单状态的一致性。

entity Order:
  state: pending_payment | paid | payment_failed | cancelled | refunded
  total_amount: Money

flow PaymentSuccessCallback:
  when PaymentProvider sends success callback for Payment
  if callback signature is valid
  and Payment amount equals Order total_amount
  and Order is pending_payment
  then System marks Order as paid
  and System emits OrderPaidEvent
  else reject INVALID_PAYMENT_CALLBACK

rule:
  must verify payment callback signature
  must be idempotent for duplicate callbacks
  must not emit duplicate OrderPaidEvent

test duplicate_callback_is_idempotent:
  given Order is already paid
  when PaymentProvider sends duplicate success callback
  then no duplicate OrderPaidEvent is emitted
```

这段不是传统代码，但它已经定义了系统最重要的部分：对象、状态、流程、规则和验收。

## USL 的位置

USL 处在自然语言和传统代码之间：

```text
比自然语言更结构化
比传统代码更语义化
比配置文件更能表达行为
比 UML 更可执行
比 Prompt 更可验证
```

它的核心价值不是“少写代码”，而是让人类从写代码上升到定义系统语义。

## 未来愿景

未来的软件开发可能会变成：

```text
人类写 USL
AI Agent 生成实现
测试验证语义
人类审查关键设计
目标语言处理性能、生态和底层细节
```

USL 的长期目标是成为 AI 编程时代的第一层软件表达语言。

一句话总结：

> USL 是所有代码生成之前的统一语义源。
