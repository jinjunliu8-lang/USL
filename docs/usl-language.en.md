# USL: Universal Semantic Language

USL stands for Universal Semantic Language.

It is a **software semantic source language** for the AI programming era. It does not try to replace Python, Java, C++, Go, or TypeScript. It also does not try to translate arbitrary code from one programming language into another with perfect fidelity.

USL focuses on what comes before code:

```text
What problem should the system solve?
Who uses it?
Which objects exist in the system?
Which states can those objects have?
Which behaviors change those states?
Which rules must always hold?
Which errors must be expressed consistently?
Which tests prove the behavior is correct?
Where may an AI Agent make changes, and where must it not?
What counts as done?
```

## Why USL Exists

Most software complexity is no longer about syntax. It is about semantics.

The hard questions are often not how to write a loop, but how to define things like:

```text
When can an order be cancelled?
Can a payment callback be processed more than once?
When should inventory be reserved?
Is this user allowed to access this data?
What should the system return when something fails?
What proves that the feature is complete?
```

These questions are not strongly tied to any single programming language. Python, Java, or C++ can implement them, but they are not always the best first layer for expressing the business semantics.

USL lets humans define system semantics first, then lets AI Agents or target-language toolchains generate implementations, tests, documentation, and interfaces.

## What USL Is Not

USL is not a universal code translator.

It is not:

```text
Python -> Java
Java -> C++
C++ -> TypeScript
```

It is closer to:

```text
USL semantic source
  -> API
  -> data models
  -> tests
  -> documentation
  -> SDKs
  -> Python / Java / Go / C++ / TypeScript implementations
```

In other words, USL is the unified semantic source before code generation.

## A Small Example

```usl
spec OrderPayment v0.1:

goal:
  Allow a buyer to pay for a pending order while keeping callback, inventory, amount, and order state consistent.

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

This is not traditional code, but it already defines the most important parts of the system: objects, states, flows, rules, and acceptance criteria.

## Where USL Fits

USL sits between natural language and traditional code:

```text
More structured than natural language
More semantic than traditional code
Better at expressing behavior than configuration files
More executable than UML
More verifiable than prompts
```

Its core value is not merely writing less code. Its value is helping humans move from writing implementation details to defining system semantics.

## Long-Term Vision

Software development may increasingly look like this:

```text
Humans write USL
AI Agents generate implementations
Tests verify the intended semantics
Humans review key design decisions
Target languages handle performance, ecosystems, and low-level details
```

The long-term goal of USL is to become the first layer of software expression in the AI programming era.

One-sentence summary:

> USL is the unified semantic source before code generation.
