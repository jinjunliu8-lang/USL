# USL v0.1 中文规范

USL 是 Universal Semantic Language 的缩写。它的准确定位是：

> USL 是一门面向 AI 编程时代的通用软件语义源语言。

USL 不是万能代码翻译器。它不负责把任意 Python 代码 100% 转成 Java、C++ 或其他语言。它负责在代码生成之前，用更高层的形式描述软件系统的语义：系统要做什么、有哪些对象、对象有哪些状态、状态如何变化、必须遵守哪些规则、怎样测试、怎样验收，以及 AI Agent 能改哪里、不能改哪里。

## 核心定位

USL 的工作流是：

```text
人写 .usl 语义源
USL CLI 解析和检查
USL CLI 生成 Agent 提示包
AI Agent 或目标语言工具链生成实现、测试、文档和接口
人审查语义是否被正确实现
```

所以 USL 的目标不是替代 Python、Java、C++，而是成为它们之前的统一语义源。

## 设计原则

- 比自然语言更结构化。
- 比传统代码更语义化。
- 比配置文件更能表达行为。
- 比 UML 更可执行。
- 比 Prompt 更可验证。
- 英文关键词，正文可以使用中文或英文。
- 第一版重视可读性和语义检查，不直接生成可运行业务代码。
- 所有重要规则都应该能被测试或验收标准覆盖。

## 适用范围

USL v0.1 适合描述：

- 业务系统
- 后端服务
- API
- 数据模型
- 权限系统
- 订单系统
- 支付流程
- 工作流
- 任务调度
- 数据管道
- 测试生成
- 接口文档
- 多语言 SDK 的语义源

USL v0.1 不适合一开始覆盖：

- 游戏引擎底层
- 操作系统内核
- 编译器后端
- 极限性能优化
- 图形渲染
- 复杂 C++ 模板元编程
- 硬件驱动

现实边界是：USL 覆盖系统的主要语义，目标语言保留性能、生态、底层和特殊实现能力。

## 顶层块

```usl
spec EmailCodeLogin v0.1:
```

声明规格名称和版本。一个文件必须包含 `spec`。

```usl
goal:
  为用户提供邮箱验证码登录能力，避免使用密码。
```

声明功能目标。

```usl
actor User:
  kind: anonymous | registered
```

声明参与者。参与者通常是用户、外部系统或第三方服务。

```usl
entity EmailCode:
  email: Email
  code_hash: String
```

声明业务对象和字段。

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

声明系统流程。v0.1 支持 `when`、`if`、`then`、`else`、`and`。

```usl
rule:
  must not reveal whether Email is registered
  must hash code before storing
```

声明必须遵守的规则。v0.1 支持 `must` 和 `must not`。

```usl
error CODE_INVALID:
  when: code incorrect
  message: 验证码错误
```

声明稳定错误码。

```usl
test valid_code_login:
  given EmailCode is active
  when User submits correct Code
  then Session is created
```

声明验收测试。v0.1 支持 `given`、`when`、`then`、`and`。

```usl
limit:
  may_modify:
    - src/auth/**
  must_not_modify:
    - src/payment/**
```

声明 AI Agent 的工程修改边界。

```usl
done:
  all tests pass
  API documented
```

声明完成标准。一个文件必须包含 `done`。

## CLI 命令

```bash
npm run usl -- parse examples/email_login.usl
npm run usl -- check examples/email_login.usl
npm run usl -- gen-prompt examples/email_login.usl
npm run usl -- explain examples/email_login.usl
```

`parse` 输出 JSON AST。`check` 输出诊断。`gen-prompt` 生成可交给 AI Agent 的 Markdown 提示包。`explain` 用中文解释规格。

## v0.1 检查

- 缺少 `spec`、`goal`、`done` 会报错。
- 未知顶层块会报错。
- `state` 引用未定义 `entity` 会报错。
- 状态转移引用 `states:` 中不存在的状态会报错。
- `flow` 引用未定义业务对象或参与者会报错。
- `flow` 中 `reject ERROR_CODE` 引用未定义错误码会报错。
- `rule` 没有关联测试时会给 warning。

## 非目标

- v0.1 不生成可运行业务代码。
- v0.1 不做任意代码到任意语言的翻译。
- v0.1 不承诺完整形式化验证。
- v0.1 不做网页编辑器或 VS Code 插件。
- v0.1 不尝试覆盖所有自然语言表达。

## 一句话总结

USL 是所有代码生成之前的统一语义源。它让人从“直接写代码”上升到“定义系统语义”，再让 AI Agent 和目标语言工具链完成实现。
