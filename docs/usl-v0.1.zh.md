# USL v0.1 中文规范

USL v0.1 的定位是：

> USL 是 AI 编程控制语言。

它不是万能代码翻译器，也不是新的通用编程语言。它用于在 AI Agent 写代码之前，描述目标、对象、状态、流程、规则、错误、测试、修改边界和完成标准，让用户不用深入学习每一种编程语言和框架，也能控制 AI 要做什么、不能做什么、怎样验证、何时完成。

## 核心工作流

```text
人写 .usl 控制规格
USL CLI 解析和检查
USL CLI 生成 Agent 执行提示
AI Agent 按规格实现代码、测试、文档和接口
人根据测试和 done 标准验收结果
```

USL 不替代 Python、Java、TypeScript、Go 或 PyTorch。目标语言和框架负责具体实现，USL 负责控制 AI 编程过程。

## 设计原则

- 比自然语言更结构化。
- 比传统代码更接近用户意图。
- 比普通 prompt 更有边界和验收标准。
- 英文关键词，正文可以使用中文或英文。
- v0.1 优先保证可读、可解析、可检查。
- 重要规则应该能被 `test` 或 `done` 覆盖。
- AI 的修改范围必须能用 `limit` 表达。

## 适用范围

USL v0.1 适合控制 AI 实现：

- 业务系统
- 后端服务
- API
- 数据模型
- 权限系统
- 订单和支付流程
- 工作流
- 任务调度
- 数据管道
- 测试生成
- 接口文档
- 深度学习训练任务规格

USL v0.1 不优先覆盖：

- 操作系统内核
- 编译器后端
- 极限性能优化
- 图形渲染底层
- 硬件驱动
- 完整形式化验证
- 任意自然语言表达

现实边界是：USL 控制主要意图、规则、边界和验收；目标语言和框架处理性能、生态、底层和特殊实现能力。

## 顶层块

```usl
spec EmailCodeLogin v0.1:
```

声明规格名称和版本。一个文件必须包含 `spec`。

```usl
goal:
  为用户提供邮箱验证码登录能力，避免使用密码。
```

声明目标。`goal` 是告诉 AI 这次到底要完成什么。

```usl
actor User:
  kind: anonymous | registered
```

声明参与者。参与者通常是用户、外部系统、第三方服务或 AI 执行环境。

```usl
entity EmailCode:
  email: Email
  code_hash: String
```

声明对象和字段。对象可以是业务对象、配置对象、训练数据、模型部件或产物。

```usl
state EmailCode:
  states: active | expired | locked | consumed
  active -> consumed
```

声明对象状态机。`states:` 是显式状态集合，`from -> to` 是允许的状态转移。

```usl
flow VerifyCode:
  when User submits Email and Code
  if EmailCode is valid and not expired
  then System creates Session
  else reject CODE_INVALID
```

声明 AI 需要实现的行为流程。v0.1 支持 `when`、`if`、`then`、`else`、`and`。

```usl
rule:
  must not reveal whether Email is registered
  must hash code before storing
```

声明必须遵守的规则。`must` 是必须做，`must not` 是绝不能做。规则是 USL 控制 AI 的核心。

```usl
error CODE_INVALID:
  when: code incorrect
  message: 验证码错误
```

声明稳定错误码，让 AI 不要随意发明不一致的错误表达。

```usl
test valid_code_login:
  given EmailCode is active
  when User submits correct Code
  then Session is created
```

声明验收测试。v0.1 支持 `given`、`when`、`then`、`and`。测试用于证明规则和流程真的被实现。

```usl
limit:
  may_modify:
    - src/auth/**
  must_not_modify:
    - src/payment/**
```

声明 AI Agent 的工程修改边界。没有边界的 AI 编程很容易变成越界修改。

```usl
done:
  all tests pass
  API documented
```

声明完成标准。一个文件必须包含 `done`。`done` 是人和 AI 对“完成”的共同定义。

## CLI 命令

```bash
npm run usl -- parse examples/email_login.usl
npm run usl -- check examples/email_login.usl
npm run usl -- gen-prompt examples/email_login.usl
npm run usl -- explain examples/email_login.usl
```

`parse` 输出 JSON AST。`check` 输出诊断。`gen-prompt` 生成可交给 AI Agent 的执行提示。`explain` 用中文解释这份 USL 如何控制 AI 实现。

## v0.1 检查

- 缺少 `spec`、`goal`、`done` 会报错。
- 未知顶层块会报错。
- `state` 引用未定义 `entity` 会报错。
- 状态转移引用 `states:` 中不存在的状态会报错。
- `flow` 引用未定义对象或参与者会报错。
- `flow` 中 `reject ERROR_CODE` 引用未定义错误码会报错。
- `rule` 没有关联测试时会给 warning。

## 非目标

- v0.1 不直接生成可运行业务代码。
- v0.1 不做任意代码到任意语言的翻译。
- v0.1 不承诺完整形式化验证。
- v0.1 不提供网页编辑器或 VS Code 插件。
- v0.1 不尝试覆盖所有自然语言表达。

## 一句话总结

USL v0.1 把 AI 编程从散乱聊天变成有目标、有规则、有边界、有测试、有完成标准的可控过程。
