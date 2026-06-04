# USL：AI 编程控制语言

USL 是一门面向 AI 编程的控制语言。

它不是为了替代 Python、JavaScript、PyTorch、Spring、React 或任何框架。它解决的是另一个问题：当用户用 AI 写代码时，需求经常散在聊天里，AI 改了什么、为什么这么改、有没有越界、怎样算完成，都不够可控。

USL 让用户用结构化中文先写清楚：

```text
我要做什么？
系统里有哪些对象和状态？
AI 应该按什么流程实现？
哪些规则必须遵守？
哪些错误必须稳定表达？
哪些测试必须通过？
AI 可以改哪里，不能改哪里？
什么条件下才算完成？
```

## 为什么需要 USL

Vibe coding 很快，但控制感弱。

一个普通需求可能是：

```text
帮我做一个邮箱验证码登录。
```

AI 可能会直接写代码，但用户很难确认：

- 是否泄露了邮箱是否注册。
- 验证码有没有哈希存储。
- 验证码能不能重复使用。
- 失败次数有没有限制。
- AI 有没有误改支付、订单或其他无关模块。
- 什么测试通过才算真的完成。

USL 的作用是把“聊天式需求”变成“可执行的控制规格”。用户不需要先学完整框架，也不需要把每一行代码怎么写说出来，但必须把目标、规则、边界和验收讲清楚。

## USL 不是什么

USL 不是万能代码翻译器。

它不是：

```text
Python -> Java
JavaScript -> Go
PyTorch -> TensorFlow
```

它更像是：

```text
USL 控制规格
  -> Agent 执行提示
  -> 目标语言和框架实现
  -> 测试、文档、接口和验收结果
```

目标语言仍然负责运行时、性能、生态和底层细节。USL 负责让人控制 AI 该实现什么、不能破坏什么、怎样证明做对了。

## 一个简单例子

```usl
spec EmailCodeLogin v0.1:

goal:
  让用户可以使用邮箱验证码登录，避免使用密码。

entity EmailCode:
  email: Email
  code_hash: String
  state: active | expired | locked | consumed

flow VerifyCode:
  when User submits Email and Code
  if EmailCode is valid and not expired
  then System creates Session
  else reject CODE_INVALID

rule:
  must not reveal whether Email is registered
  must hash code before storing
  must not allow consumed code to be reused

test consumed_code_cannot_login:
  given EmailCode is consumed
  when User submits the same Code again
  then error = CODE_INVALID

limit:
  may_modify:
    - src/auth/**
  must_not_modify:
    - src/payment/**

done:
  所有登录测试通过
  验证码不会明文存储
  不会泄露邮箱注册状态
```

这不是传统代码，但它已经控制了 AI 编程中最重要的部分：目标、对象、流程、规则、测试、修改边界和完成标准。

## 核心价值

USL 的第一版核心不是“少写代码”，而是：

- 让需求不只停留在聊天记录里。
- 让 AI 有明确的实现边界。
- 让重要规则变成可检查的测试和完成标准。
- 让不想深入学习具体语言和框架的人，也能控制 AI 编程结果。
- 让懂编程的人也能减少 AI 自作主张和越界修改。

一句话总结：

> USL 把 vibe coding 变成有规格、有规则、有边界、有验收的可控 AI 编程。
