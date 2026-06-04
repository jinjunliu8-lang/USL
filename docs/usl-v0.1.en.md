# USL v0.1 English Specification

USL v0.1 is positioned as:

> USL is a control language for AI coding.

It is not a universal code translator and it is not a new general-purpose programming language. It is used before an AI agent writes code to describe goals, objects, states, flows, rules, errors, tests, change boundaries, and completion criteria. This lets users control what the AI should do, what it must not do, how the result should be verified, and when the work is done without first learning every target language or framework.

## Core Workflow

```text
Human writes a .usl control spec
USL CLI parses and checks it
USL CLI generates an Agent execution prompt
AI Agent implements code, tests, docs, and interfaces according to the spec
Human accepts the result using tests and done criteria
```

USL does not replace Python, Java, TypeScript, Go, or PyTorch. Target languages and frameworks handle implementation; USL controls the AI coding process.

## Design Principles

- More structured than natural language.
- Closer to user intent than traditional code.
- More bounded and verifiable than ordinary prompts.
- English keywords, with body text allowed in English or Chinese.
- v0.1 prioritizes readability, parsing, and checks.
- Important rules should be covered by `test` or `done`.
- AI change boundaries should be expressed with `limit`.

## Intended Scope

USL v0.1 is suitable for controlling AI implementation of:

- business systems
- backend services
- APIs
- data models
- permission systems
- order and payment flows
- workflows
- task scheduling
- data pipelines
- test generation
- API documentation
- deep learning training task specs

USL v0.1 does not prioritize:

- operating system kernels
- compiler backends
- extreme performance optimization
- low-level graphics rendering
- hardware drivers
- full formal verification
- arbitrary natural-language expressions

The practical boundary is: USL controls main intent, rules, boundaries, and acceptance criteria; target languages and frameworks handle performance, ecosystem details, low-level control, and specialized implementation.

## Top-Level Blocks

```usl
spec EmailCodeLogin v0.1:
```

Declares the specification name and version. A document must include `spec`.

```usl
goal:
  Allow users to log in with an email verification code instead of a password.
```

Declares the goal. `goal` tells the AI what must be completed.

```usl
actor User:
  kind: anonymous | registered
```

Declares an actor. Actors are usually users, external systems, third-party services, or AI execution environments.

```usl
entity EmailCode:
  email: Email
  code_hash: String
```

Declares an object and its fields. Objects can be business objects, configuration objects, training data, model components, or artifacts.

```usl
state EmailCode:
  states: active | expired | locked | consumed
  active -> consumed
```

Declares an object state machine. `states:` is the explicit state set, and `from -> to` is an allowed transition.

```usl
flow VerifyCode:
  when User submits Email and Code
  if EmailCode is valid and not expired
  then System creates Session
  else reject CODE_INVALID
```

Declares behavior the AI should implement. v0.1 supports `when`, `if`, `then`, `else`, and `and`.

```usl
rule:
  must not reveal whether Email is registered
  must hash code before storing
```

Declares rules that must be preserved. `must` means required, and `must not` means forbidden. Rules are the core control surface of USL.

```usl
error CODE_INVALID:
  when: code incorrect
  message: Invalid code
```

Declares stable error codes so the AI does not invent inconsistent error behavior.

```usl
test valid_code_login:
  given EmailCode is active
  when User submits correct Code
  then Session is created
```

Declares acceptance tests. v0.1 supports `given`, `when`, `then`, and `and`. Tests prove that flows and rules were implemented.

```usl
limit:
  may_modify:
    - src/auth/**
  must_not_modify:
    - src/payment/**
```

Declares engineering change boundaries for the AI agent. Without boundaries, AI coding can drift into unrelated files.

```usl
done:
  all tests pass
  API documented
```

Declares completion criteria. A document must include `done`. `done` is the shared definition of completion for humans and AI.

## CLI Commands

```bash
npm run usl -- parse examples/email_login.usl
npm run usl -- check examples/email_login.usl
npm run usl -- gen-prompt examples/email_login.usl
npm run usl -- explain examples/email_login.usl
```

`parse` prints the JSON AST. `check` prints diagnostics. `gen-prompt` generates an execution prompt for an AI agent. `explain` explains in Chinese how the USL spec controls AI implementation.

## v0.1 Checks

- Missing `spec`, `goal`, or `done` is an error.
- Unknown top-level blocks are errors.
- A `state` block referencing an undefined `entity` is an error.
- A state transition referencing a state not declared in `states:` is an error.
- A `flow` referencing undefined objects or actors is an error.
- A `flow` using `reject ERROR_CODE` with an undefined error code is an error.
- A `rule` with no related test produces a warning.

## Non-Goals

- v0.1 does not directly generate runnable business code.
- v0.1 does not translate arbitrary code into arbitrary target languages.
- v0.1 does not promise full formal verification.
- v0.1 does not provide a web editor or VS Code extension.
- v0.1 does not attempt to cover every natural-language expression.

## One-Sentence Summary

USL v0.1 turns AI coding from scattered conversation into a controlled process with goals, rules, boundaries, tests, and completion criteria.
