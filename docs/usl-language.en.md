# USL: A Control Language For AI Coding

USL is a control language for AI coding.

It is not trying to replace Python, JavaScript, PyTorch, React, Spring, or any other programming language or framework. It solves a different problem: when people code with AI through conversation, the requirements are scattered across chat, the agent's boundaries are unclear, and it is hard to know whether the result is actually done.

USL lets humans write a structured control spec before implementation:

```text
What should be built?
Which objects and states matter?
Which flows should the AI implement?
Which rules must always hold?
Which errors must be stable?
Which tests prove the behavior?
Where may the AI make changes?
What counts as done?
```

## Why USL Exists

Vibe coding is fast, but it often lacks control.

A natural request such as:

```text
Build email code login for me.
```

does not make these constraints explicit:

- The system must not reveal whether an email is registered.
- Codes must be stored as hashes.
- Consumed codes must not be reusable.
- Failed attempts may need limits.
- The agent must not change payment or order modules.
- A concrete completion standard is needed.

USL turns conversational intent into an executable control spec. Users do not need to learn every target language or framework first, and they do not need to describe every line of code. They do need to state intent, rules, boundaries, tests, and completion criteria.

## What USL Is Not

USL is not a universal code translator.

It is not:

```text
Python -> Java
JavaScript -> Go
PyTorch -> TensorFlow
```

It is closer to:

```text
USL control spec
  -> Agent implementation prompt
  -> target language and framework code
  -> tests, docs, interfaces, and acceptance evidence
```

Target languages still handle runtime behavior, performance, ecosystems, and low-level details. USL controls what the AI should implement, what it must not break, and how the result should be verified.

## A Small Example

```usl
spec EmailCodeLogin v0.1:

goal:
  Allow users to log in with an email verification code instead of a password.

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
  all login tests pass
  codes are not stored in plaintext
  email registration status is not leaked
```

This is not traditional code, but it controls the important parts of AI coding: goal, objects, flows, rules, tests, change boundaries, and completion criteria.

## Core Value

USL v0.1 is not primarily about writing fewer lines of code. It is about:

- Keeping requirements outside of fragile chat history.
- Giving AI agents explicit implementation boundaries.
- Turning important rules into tests and done criteria.
- Letting people control AI coding without first learning every target language or framework.
- Helping experienced engineers reduce agent drift and unrelated changes.

One-sentence summary:

> USL turns vibe coding into controlled AI coding with specs, rules, boundaries, and acceptance criteria.
