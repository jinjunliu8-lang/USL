# USL v0.1 English Specification

USL stands for Universal Semantic Language. Its intended position is:

> USL is a general-purpose software semantic source language for the AI programming era.

USL is not a universal code translator. It is not designed to convert arbitrary Python code into Java, C++, or any other language with 100% fidelity. Instead, USL describes software semantics before implementation: what the system should do, which objects exist, which states they can have, how states change, which rules must hold, how behavior is tested, what counts as done, and where an AI Agent is allowed or forbidden to make changes.

## Core Positioning

The USL workflow is:

```text
Human writes a .usl semantic source
USL CLI parses and checks it
USL CLI generates an Agent prompt pack
AI Agent or target-language tooling generates implementation, tests, docs, and interfaces
Human reviews whether the intended semantics were implemented correctly
```

USL is not meant to replace Python, Java, or C++. It is meant to become a shared semantic source before those target languages.

## Design Principles

- More structured than natural language.
- More semantic than traditional code.
- Better at expressing behavior than configuration files.
- More executable than UML.
- More verifiable than prompts.
- English keywords, with body text allowed in English or Chinese.
- v0.1 prioritizes readability and semantic checking, not direct generation of runnable business code.
- Important rules should be covered by tests or completion criteria.

## Intended Scope

USL v0.1 is suitable for describing:

- business systems
- backend services
- APIs
- data models
- permission systems
- order systems
- payment flows
- workflows
- task scheduling
- data pipelines
- test generation
- API documentation
- semantic sources for multi-language SDKs

USL v0.1 is not intended to cover these areas first:

- low-level game engine internals
- operating system kernels
- compiler backends
- extreme performance optimization
- graphics rendering
- complex C++ template metaprogramming
- hardware drivers

The practical boundary is: USL captures the main system semantics, while target languages still handle performance, ecosystems, low-level control, and specialized implementation details.

## Top-Level Blocks

```usl
spec EmailCodeLogin v0.1:
```

Declares the specification name and version. A document must include `spec`.

```usl
goal:
  Allow users to log in with an email verification code instead of a password.
```

Declares the feature goal.

```usl
actor User:
  kind: anonymous | registered
```

Declares an actor. Actors are usually users, external systems, or third-party services.

```usl
entity EmailCode:
  email: Email
  code_hash: String
```

Declares a business object and its fields.

```usl
state EmailCode:
  states: active | expired | locked | consumed
  active -> consumed
```

Declares an entity state machine. `states:` is the explicit state set, and `from -> to` is an allowed transition.

```usl
flow VerifyCode:
  when User submits Email and Code
  if EmailCode is valid and not expired
  then System creates Session
  else reject CODE_INVALID
```

Declares system behavior. v0.1 supports `when`, `if`, `then`, `else`, and `and`.

```usl
rule:
  must not reveal whether Email is registered
  must hash code before storing
```

Declares rules that must be preserved. v0.1 supports `must` and `must not`.

```usl
error CODE_INVALID:
  when: code incorrect
  message: Invalid code
```

Declares stable error codes.

```usl
test valid_code_login:
  given EmailCode is active
  when User submits correct Code
  then Session is created
```

Declares acceptance tests. v0.1 supports `given`, `when`, `then`, and `and`.

```usl
limit:
  may_modify:
    - src/auth/**
  must_not_modify:
    - src/payment/**
```

Declares engineering boundaries for an AI Agent.

```usl
done:
  all tests pass
  API documented
```

Declares completion criteria. A document must include `done`.

## CLI Commands

```bash
npm run usl -- parse examples/email_login.usl
npm run usl -- check examples/email_login.usl
npm run usl -- gen-prompt examples/email_login.usl
npm run usl -- explain examples/email_login.usl
```

`parse` prints the JSON AST. `check` prints diagnostics. `gen-prompt` generates a Markdown implementation prompt for an AI Agent. `explain` explains the spec in Chinese.

## v0.1 Checks

- Missing `spec`, `goal`, or `done` is an error.
- Unknown top-level blocks are errors.
- A `state` block referencing an undefined `entity` is an error.
- A state transition referencing a state not declared in `states:` is an error.
- A `flow` referencing undefined business objects or actors is an error.
- A `flow` using `reject ERROR_CODE` with an undefined error code is an error.
- A `rule` with no related test produces a warning.

## Non-Goals

- v0.1 does not generate runnable business code.
- v0.1 does not translate arbitrary code into arbitrary target languages.
- v0.1 does not promise full formal verification.
- v0.1 does not include a web editor or VS Code extension.
- v0.1 does not attempt to cover every natural-language expression.

## One-Sentence Summary

USL is the unified semantic source before code generation. It helps humans define system semantics first, then lets AI Agents and target-language toolchains produce implementations.
