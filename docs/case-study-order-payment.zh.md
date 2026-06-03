# 案例：订单支付系统的 USL 语义源

这个案例用一个经典电商订单支付系统展示 USL 的价值。它不是把某段代码翻译成另一种语言，而是先把订单支付的核心语义写成一份统一源头。

对应文件：

```text
examples/order_payment.usl
```

## 为什么选择订单支付

订单支付是典型业务系统，因为它包含真实软件复杂度：

- 订单状态不能随意跳转。
- 支付回调可能重复到达。
- 支付金额不能相信前端。
- 支付成功后只能发一次订单已支付事件。
- 库存需要在支付前锁定，在失败或取消后释放。
- 每次支付回调都需要审计记录。

这些复杂度不是 Python、Java、Go 或 C++ 的语法问题，而是系统语义问题。

## 语义源设计

这个案例把系统拆成几类语义。

### 参与者

```usl
actor Buyer:
  kind: registered

actor PaymentProvider:
  kind: external_service
```

`Buyer` 是内部用户，`PaymentProvider` 是外部支付服务。先区分参与者，可以让 AI Agent 明白哪些输入来自用户，哪些输入来自第三方系统。

### 业务对象

```usl
entity Order:
  state: pending_payment | paid | payment_failed | cancelled | refunded
  total_amount: Money

entity Payment:
  state: created | processing | succeeded | failed | cancelled

entity InventoryReservation:
  state: reserved | released | consumed
```

这几个对象共同表达“订单支付”的主语义：订单、支付单、库存预占、支付成功事件和审计日志。

### 状态机

```usl
state Order:
  states: pending_payment | paid | payment_failed | cancelled | refunded
  pending_payment -> paid
  pending_payment -> payment_failed
  pending_payment -> cancelled
  paid -> refunded
```

状态机是这个案例的核心。比如 `cancelled -> paid` 没有被声明，因此它不应该被实现。

### 流程

```usl
flow PaymentSuccessCallback:
  when PaymentProvider sends success callback for Payment
  if callback signature is valid
  and Payment amount equals Order total_amount
  and Order is pending_payment
  then System marks Payment as succeeded
  and System marks Order as paid
  and System marks InventoryReservation as consumed
  and System emits OrderPaidEvent
  and System records PaymentAuditLog
  else reject INVALID_PAYMENT_CALLBACK
```

这段不是传统代码，但它已经定义了关键业务行为：验签、金额校验、状态变更、库存消耗、事件发送和审计记录。

### 规则

```usl
rule:
  must verify payment callback signature
  must be idempotent for duplicate callbacks
  must not emit duplicate OrderPaidEvent
  must not trust amount from frontend
  must use Order total_amount from server
```

规则是给 AI Agent 的边界。它不只告诉 AI “做支付”，还告诉它哪些事情绝对不能错。

### 验收测试

```usl
test duplicate_callback_is_idempotent:
  given Order is already paid
  and Payment is already succeeded
  when PaymentProvider sends duplicate success callback
  then callback handling is idempotent
  and no duplicate OrderPaidEvent is emitted
```

测试把抽象规则变成可检查结果。没有测试，USL 就会退化成高级 Prompt；有测试，USL 才更接近可验证的语义源。

## 这个案例说明了什么

订单支付案例展示了 USL 的定位：

```text
USL 描述系统语义
AI Agent 根据语义实现代码
测试验证语义是否被满足
目标语言处理框架、性能和生态细节
```

也就是说，USL 不替代目标语言，而是成为目标语言之前的统一语义源。
