# 中介语言：USL

## 一句话定义

USL v0.1 是一门 **AI 编程控制语言**。

它的目标不是替代 Python、JavaScript、Go、Java、C++ 或 Rust，也不是把 Prompt 写得更长，而是在 AI Agent 写代码之前，把人的意图整理成一份更清楚、更可检查、更容易验收的控制规格。

一句话说：

> USL 把模糊想法变成可交给 AI Agent 执行、检查和验收的控制规格。

更具体地说：

```text
人写 USL 控制规格
USL CLI 解析和检查规格
USL CLI 生成 Agent 执行提示
AI Agent 根据规格实现代码、测试、文档和接口
人根据测试和 done 标准验收结果
```

USL 当前最稳定的定位是：

```text
AI coding control spec
```

也就是：

```text
控制 AI 应该做什么
控制 AI 不能做什么
控制 AI 怎样验证
控制 AI 什么时候算完成
```

系统设计和 Agent 开发是 USL 的重要应用方向，但在 v0.1 阶段，它们还不是完整成熟的 DSL。更准确的说法是：

> USL v0.1 当前是 AI 编程控制规格；它正在把系统设计和 Agent 开发中的意图、规则、边界、测试沉淀成可执行的规格形态。

## ICL 与 USL 的关系

ICL 是早期命名，意思是 Intent Control Language，即“意图控制语言”。

它强调的是：

```text
人类意图 -> AI 执行 -> 测试验证 -> 系统上线
```

现在统一使用 USL 这个名称。

可以这样理解：

```text
ICL:
  早期思想命名，强调“意图控制”

USL:
  当前项目名称，强调“AI 编程控制规格”
```

这不是两套并行语言。正文统一使用 USL，ICL 只作为命名来源保留。

## 当前 v0.1 的真实定位

USL v0.1 的真实定位要收紧，不能夸大。

它现在不是：

```text
万能代码生成语言
完整系统设计 DSL
完整 Agent 工作流语言
完整形式化验证语言
任意语言之间的翻译器
```

它现在是：

```text
AI 编程前的控制规格
```

当前 v0.1 主要解决这些问题：

```text
目标是什么？
有哪些参与者？
有哪些对象？
对象有哪些状态？
系统应该有哪些流程？
必须遵守哪些规则？
失败时有哪些稳定错误码？
怎样测试？
AI 可以改哪里？
AI 不能改哪里？
怎样算完成？
```

所以 USL v0.1 更像是站在代码之前的一层：

```text
意图层
规则层
边界层
验收层
```

目标语言仍然负责：

```text
运行时细节
框架生态
性能优化
并发模型
内存管理
系统调用
特殊库能力
```

USL 和目标语言的关系是：

```text
USL 负责“应该实现什么、不能破坏什么、怎样证明做对了”
目标语言负责“在具体生态里如何落地实现”
```

## 为什么需要 USL

过去程序员的核心路径是：

```text
需求 -> 设计 -> 代码 -> 测试 -> 部署 -> 维护
```

现在 AI 正在接管中间大量执行层工作，例如：

- 写代码
- 补测试
- 改 Bug
- 查文档
- 生成接口
- 生成部署脚本
- 修改前后端实现

但 AI 仍然需要稳定输入。聊天式需求通常不够稳定，因为它经常有这些问题：

- 目标不清楚。
- 边界不清楚。
- 成功标准不清楚。
- 业务对象和状态没定义清楚。
- 错误和异常没定义清楚。
- AI 不知道哪些文件能改、哪些不能改。
- AI 容易过度发挥，改出需求之外的东西。

USL 解决的就是这个问题：

> 把散在聊天里的需求、规则、边界和验收标准，变成一份可解析、可检查、可交给 Agent 执行的控制规格。

未来真正重要的能力不只是“会不会手写每一行代码”，而是能不能清楚表达：

```text
我要什么
为什么要
边界在哪里
怎样算成功
出了问题怎么判断
```

## USL 与 Prompt 的区别

普通 Prompt 是请求。

例如：

```text
帮我做一个登录功能，注意安全。
```

这个请求太模糊。AI 可能写出一个看起来能跑的登录功能，但你很难知道：

```text
验证码多久过期？
是否限流？
错误码是否稳定？
是否泄露用户是否注册？
输错多少次锁定？
是否记录登录事件？
测试覆盖了哪些边界？
AI 是否越界修改了其他模块？
```

USL 是规格。

下面是一个接近当前 v0.1 语法的示例。

```usl
spec EmailCodeLogin v0.1:

goal:
  为用户提供邮箱验证码登录能力，避免使用密码。

actor User:
  kind: anonymous | registered

entity EmailCode:
  email: Email
  code_hash: String
  expires_at: DateTime
  failed_count: Int
  locked_until: DateTime?

entity Session:
  token: JWT
  expires_in: 7d

flow SendCode:
  when User submits Email
  then System generates 6-digit code
  and System stores hashed EmailCode
  and System sends code to Email
  and System rate limits same Email for 60s
  else reject RATE_LIMITED

flow VerifyCode:
  when User submits Email and Code
  if EmailCode is valid and not expired
  and EmailCode is not locked
  then System creates Session
  and System records LoginEvent
  else reject CODE_INVALID

rule:
  must not reveal whether Email is registered
  must hash code before storing
  must lock Email for 15m after 5 failed attempts
  must return stable error codes

error CODE_INVALID:
  when: code incorrect
  message: 验证码错误

error RATE_LIMITED:
  when: resend within 60s
  message: 请求过于频繁

error ACCOUNT_LOCKED:
  when: failed 5 times
  message: 账户暂时锁定

test valid_code_login:
  given EmailCode is active
  when User submits correct Code
  then Session is created

test too_many_failures:
  given User failed 5 times
  when User submits Code again
  then error = ACCOUNT_LOCKED

limit:
  may_modify:
    - src/auth/**
    - tests/auth/**
  must_not_modify:
    - src/payment/**
    - database/old_migrations/**

done:
  all tests pass
  API documented
  no security warning
  no existing behavior broken
```

Prompt 让 AI 猜。

USL 让 AI 按规格执行，并让结果更容易检查和验证。

## USL 的核心块

USL v0.1 的核心块保持很小：

```text
spec    定义一个功能或系统规格
goal    定义目标
actor   定义参与者
entity  定义业务对象或工程对象
state   定义状态机
flow    定义流程
rule    定义规则
error   定义稳定错误码
test    定义验收测试
limit   定义 AI Agent 的修改边界
done    定义完成标准
```

其中最核心的是：

```text
goal
rule
test
limit
done
```

`actor`、`entity`、`state`、`flow`、`error` 用来补充参与者、对象、状态、流程和稳定错误，让 AI 不只拿到一句需求，而是拿到完整的工程控制面。

### Entity：对象

对象代表系统里的核心实体。

```usl
entity User:
  id: UUID
  email: String
  state: active | locked | deleted
```

对象可以是用户、订单、支付、文章、评论、库存、任务、文件、消息，也可以是模型、工具、Agent 任务或 Agent 记忆。

### State：状态

状态是现代软件的核心。

```usl
state Order:
  states: pending_payment | paid | cancelled | refunded
  pending_payment -> paid
  pending_payment -> cancelled
  paid -> refunded
```

很多 Bug 本质上都是状态没定义清楚。

如果订单不允许从 `cancelled` 变成 `paid`，就不要在状态机里写这条转移。

### Flow：流程

流程描述事情如何发生。

```usl
flow SubmitOrder:
  when User confirms cart
  then System creates Order
  and System locks Inventory
  and System creates PaymentIntent
```

它不写代码细节，但写清楚因果关系。

### Rule：规则

规则是 AI 的硬边界。

```usl
rule:
  must not oversell inventory
  must check permission before reading private data
  must log all admin actions
```

AI 很容易“看起来实现了”，但规则没守住。所以 `rule` 是 USL 的核心。

### Test：验收

测试把抽象规则变成可检查结果。

```usl
test user_cannot_read_others_order:
  given UserA owns OrderA
  when UserB requests OrderA
  then error = FORBIDDEN
```

没有测试，USL 会退化成高级 Prompt。

有测试，用户才能判断 AI 是否真的按规则实现。

### Limit：边界

边界控制 Agent 可以碰哪里，不能碰哪里。

```usl
limit:
  may_modify:
    - src/order/**
    - tests/order/**

  must_not_modify:
    - src/auth/**
    - src/payment/**
```

没有边界的 AI 编程很容易变成越界修改。

### Done：完成标准

完成标准定义什么时候才算结束。

```usl
done:
  all tests pass
  API documented
  no security warning
  no existing behavior broken
```

`done` 是人和 Agent 对“完成”的共同定义。

## 面向系统设计的 USL

系统设计是 USL 的重要应用方向。

但要注意：在 v0.1 阶段，USL 还不是完整的系统设计 DSL。它当前更适合把系统设计里最容易被 AI 写错的内容提前说清楚：

```text
系统目标
参与者
业务对象
状态机
核心流程
权限规则
错误码
幂等规则
审计要求
测试验收
工程修改边界
```

### 当前 v0.1 可解析示例：订单支付

下面这个示例接近当前仓库 `examples/order_payment.zh.usl` 的写法，适合用于控制 AI 实现订单支付系统。

```usl
spec OrderPayment v0.1:

goal:
  买家可以为待支付订单完成付款。系统必须保证支付回调、库存预占、支付金额、订单状态和审计日志保持一致。

actor Buyer:
  kind: registered

actor PaymentProvider:
  kind: external_service

entity Order:
  id: UUID
  state: pending_payment | paid | payment_failed | cancelled | refunded
  total_amount: Money
  currency: CNY

entity Payment:
  id: UUID
  order_id: UUID
  state: created | processing | succeeded | failed | cancelled
  amount: Money
  currency: CNY

entity PaymentAuditLog:
  payment_id: UUID
  action: String
  payload_hash: String
  created_at: DateTime

state Order:
  states: pending_payment | paid | payment_failed | cancelled | refunded
  pending_payment -> paid
  pending_payment -> payment_failed
  pending_payment -> cancelled
  paid -> refunded

flow PaymentSuccessCallback:
  when PaymentProvider sends Payment success callback
  if callback signature is valid
  and Payment.amount equals Order.total_amount
  and Order is pending_payment
  then System marks Payment as succeeded
  and System marks Order as paid
  and System emits OrderPaidEvent
  and System records PaymentAuditLog
  else reject INVALID_PAYMENT_CALLBACK

rule:
  must verify payment callback signature
  must ensure duplicate callback is idempotent
  must not emit duplicate OrderPaidEvent
  must not trust payment amount from frontend
  must use server-side Order.total_amount

error INVALID_PAYMENT_CALLBACK:
  when: payment callback signature invalid or amount mismatch
  message: 支付回调无效

test duplicate_callback_is_idempotent:
  given Order is already paid
  and Payment is already succeeded
  when PaymentProvider sends same success callback again
  then Order remains paid
  and Payment remains succeeded
  and OrderPaidEvent is not emitted twice

limit:
  may_modify:
    - src/order/**
    - src/payment/**
    - tests/order-payment/**

  must_not_modify:
    - src/auth/**
    - database/legacy_migrations/**

done:
  all payment tests pass
  callback idempotency verified
  callback signature verification documented
  no existing order API behavior broken
```

这段 USL 不依赖具体目标语言，但它定义了系统正确性的核心：

```text
对象
状态
状态转移
规则
异常
测试
完成标准
```

AI 拿到这样的规格后，才更有可能生成正确的后端接口、数据库表、测试用例、错误码和文档。

## 面向 Agent 开发的 USL

Agent 开发也是 USL 的重要应用方向。

但同样要注意：下面的 Agent 示例是 **概念示例 / 未来扩展方向**。它表达的是 USL 可以如何描述 Agent 工作协议，不代表当前 v0.1 CLI 已经完整理解工具权限、记忆、停止条件等所有语义。

Agent 本身也有对象、状态、工具、权限和失败模式。

面向 Agent 的 USL 未来应该能表达：

```text
Agent 的目标
Agent 可以使用哪些工具
Agent 什么时候调用工具
Agent 不能调用哪些工具
Agent 如何记录记忆
Agent 如何处理失败
Agent 如何停止
Agent 如何向用户确认高风险动作
Agent 如何验证任务完成
```

### 概念示例 / 未来扩展方向：代码修复 Agent

```usl
spec RepoFixAgent v0.1:

goal:
  Agent 根据用户请求在代码仓库中定位问题、修改代码、运行测试，并输出变更摘要。

actor User:
  kind: human

actor Agent:
  kind: ai_worker

entity Task:
  id: UUID
  state: received | analyzing | editing | testing | completed | blocked

entity Tool:
  name: String
  risk: low | medium | high

state Task:
  states: received | analyzing | editing | testing | completed | blocked
  received -> analyzing
  analyzing -> editing
  editing -> testing
  testing -> completed
  analyzing -> blocked
  editing -> blocked
  testing -> blocked

flow AnalyzeRepo:
  when User gives implementation request
  then Agent reads relevant files
  and Agent identifies existing patterns
  and Agent creates implementation plan

flow EditCode:
  when Agent has enough context
  if requested change is within limit
  then Agent modifies relevant files
  else reject OUT_OF_SCOPE

flow VerifyChange:
  when Agent finishes editing
  then Agent runs focused tests
  and Agent checks changed behavior
  and Agent reports result to User

rule:
  must preserve user changes
  must not run destructive git commands without explicit user request
  must prefer existing project patterns
  must run relevant tests when feasible
  must explain any unverified risk

error OUT_OF_SCOPE:
  when: requested change exceeds allowed files or task boundary
  message: 修改超出任务边界

test preserves_user_changes:
  given repository has unrelated user changes
  when Agent edits task files
  then unrelated changes remain untouched

test verifies_after_edit:
  given Agent modified implementation
  when tests are available
  then Agent runs relevant tests
  and reports pass or failure clearly

limit:
  may_modify:
    - src/**
    - tests/**

  must_not_modify:
    - .git/**
    - production_secrets/**

done:
  requested behavior implemented
  relevant tests pass or unverified reason is stated
  changed files summarized
  no unrelated user changes reverted
```

这类规格的价值不在于“让 Agent 更会聊天”，而在于：

```text
让 Agent 的目标、权限、工具、流程、失败处理和验收标准可控。
```

## 当前能力与未来方向

这一节用来明确区分当前能力和未来愿景。

### 当前 v0.1 已支持

当前 USL v0.1 已支持这些顶层块：

```text
spec
goal
actor
entity
state
flow
rule
error
test
limit
done
```

当前 CLI 能做：

```text
parse:
  解析 USL 文件，输出 JSON AST。

check:
  检查缺失块、未知块、状态引用、流程引用、错误码引用、规则测试覆盖等问题。

gen-prompt:
  根据 USL 生成可交给 AI Agent 的执行提示。

explain:
  用中文解释这份 USL 如何控制 AI 实现。
```

当前 v0.1 最适合：

```text
业务系统
后端服务
API
数据模型
权限系统
订单和支付流程
工作流
任务调度
数据管道
测试生成
接口文档
深度学习训练任务规格
```

### 未来方向

USL 未来可以继续扩展到：

```text
系统设计 DSL:
  更完整地表达架构、模块、接口、依赖、部署、成本、安全。

Agent 工作协议:
  更完整地表达工具权限、记忆、计划、停止条件、人工确认、失败恢复。

更多验证能力:
  更强的规则覆盖检查、状态机检查、测试生成、静态分析集成。

目标语言后端:
  从 USL 生成更稳定的代码骨架、测试骨架、API schema、文档和 Agent 任务计划。
```

这些是合理方向，但不应该被说成 v0.1 已经完整完成的能力。

## 学习路径

未来可能会形成一种 T 型能力结构：

```text
横向：掌握 USL / 中介语义语言
纵向：在必要领域深入一门或几门具体语言
```

也就是：

```text
大部分软件开发用 USL 描述语义、流程、规则和测试。
少数关键部分再深入 Python、Java、C++、Rust、TypeScript 等目标语言做优化或特殊实现。
```

USL 负责：

```text
需求
对象
状态
流程
规则
权限
错误
测试
API
数据模型
业务约束
Agent 边界
```

具体语言负责：

```text
性能优化
内存控制
并发模型
框架细节
系统调用
硬件交互
特殊库调用
语言生态能力
```

过去的学习顺序常常是：

```text
先学 Python / Java / C++ 语法
再学怎么做系统
再学业务建模
```

未来可能变成：

```text
先学 USL，学会描述系统本质
再学 AI 协作、测试和验证
最后按需学习目标语言的关键细节
```

不同方向的学习路径可以是：

```text
普通开发者：
  USL + AI 协作 + 基础 Python/TypeScript

后端工程师：
  USL + 数据库 + API + Java/Go/Python 框架

AI 工程师：
  USL + Python + 数据管道 + 模型接口 + 推理服务

系统工程师：
  USL + C++/Rust + 内存 + 并发 + 性能

架构师：
  USL + 分布式系统 + 领域建模 + 安全 + 成本控制

Agent 开发者：
  USL + 工具调用 + 任务规划 + 记忆管理 + 权限控制 + 验证闭环
```

关键变化是：

> 过去：具体语言是入口。  
> 未来：语义建模是入口。

## 现有工具与 USL 的关系

GitHub 和开源生态里已经有很多接近 USL 的局部工具，但还没有一门真正统一的、面向 AI 时代系统设计和 Agent 开发的 USL。

可以这样理解：

```text
Protobuf / Thrift:
  解决数据结构和 RPC 接口。

OpenAPI / Smithy:
  解决 API 规格、SDK 和 server stub 生成。

Dafny:
  解决规格验证和多语言编译。

Haxe / Nim:
  解决一门源语言到多平台编译。

MLIR:
  解决编译器中间表示和优化基础设施。

CUE / KCL:
  解决 schema、配置、约束和策略。
```

这些都是 USL 的局部拼图。

但 USL 想要站得更高一些：

```text
业务对象
状态机
流程
权限
错误
副作用
测试
约束
API
数据模型
部署目标
性能策略
Agent 工具边界
Agent 执行协议
目标语言后端
```

更准确的判断是：

> 现在已经有很多 USL 的零件，但还缺一门把它们统一起来、并专门服务 AI Agent 编程的系统语义源语言。

这句话是愿景，不是对 USL v0.1 当前能力的宣称。

## 最小可用模板

以后可以直接用这个模板写 USL：

```usl
spec <Name> v0.1:

goal:
  <这个功能、系统或 Agent 要解决什么问题>

actor <ActorName>:
  kind: <human | system | external_service | ai_worker>

entity <EntityName>:
  <field>: <type>

state <EntityName>:
  states: <state_a> | <state_b> | <state_c>
  <state_a> -> <state_b>

flow <FlowName>:
  when <某个事件发生>
  if <条件成立>
  then <系统或 Agent 应该做什么>
  and <后续副作用>
  else reject <ERROR_CODE>

rule:
  must <必须遵守的规则>
  must not <禁止发生的事情>

error <ERROR_CODE>:
  when: <什么时候出现>
  message: <给用户或系统的提示>

test <test_name>:
  given <前置条件>
  when <动作>
  then <预期结果>

limit:
  may_modify:
    - <允许 AI 修改的范围>

  must_not_modify:
    - <禁止 AI 修改的范围>

done:
  <怎样算完成>
```

这个模板的重点不是让人学习复杂语法，而是让人养成一种表达习惯：

```text
先说目标
再说对象和状态
再说流程
再说规则
再说测试
最后说边界和完成标准
```

## 总结

USL 的本质不是语法，而是一种新的编程观：

> 代码不再是第一表达层。意图、对象、状态、流程、规则、边界和验收标准，才是第一表达层。

过去的高手是：

```text
我知道怎么实现。
```

未来的高手是：

```text
我知道应该实现什么、为什么这样实现、怎样证明它实现对了。
```

USL v0.1 当前要做的事情是：

```text
人写 USL
USL CLI 检查规格
USL CLI 生成 Agent 提示
AI 写代码和测试
人按 done 标准验收
```

系统设计和 Agent 开发是 USL 的重要应用方向，但要分清楚：

```text
当前能力：
  AI 编程控制规格。

未来方向：
  更完整的系统设计 DSL 和 Agent 工作协议。
```

这就是面向 AI 编程时代的中介语言。
