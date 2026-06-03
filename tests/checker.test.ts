import { describe, expect, it } from "vitest";
import { checkUSL } from "../src/checker.js";
import { parseUSL } from "../src/parser.js";

describe("checkUSL", () => {
  it("reports a missing spec", () => {
    const diagnostics = checkUSL(parseUSL(`
goal:
  ok
done:
  ok
`));

    expect(diagnostics).toContainEqual(expect.objectContaining({ code: "MISSING_SPEC" }));
  });

  it("reports undefined flow entity references", () => {
    const diagnostics = checkUSL(parseUSL(`
spec BadFlow v0.1:
goal:
  ok
flow UseOrder:
  when User submits Order
  then System creates Invoice
done:
  ok
`));

    expect(diagnostics).toContainEqual(expect.objectContaining({ code: "UNKNOWN_FLOW_ENTITY" }));
  });

  it("reports undefined rejected error codes", () => {
    const diagnostics = checkUSL(parseUSL(`
spec BadError v0.1:
goal:
  ok
actor User:
entity Order:
flow PayOrder:
  when User submits Order
  else reject INVALID_STATE
done:
  ok
`));

    expect(diagnostics).toContainEqual(expect.objectContaining({ code: "UNKNOWN_ERROR_CODE" }));
  });

  it("reports state machines for undefined entities", () => {
    const diagnostics = checkUSL(parseUSL(`
spec BadState v0.1:
goal:
  ok
state Order:
  states: pending | paid
  pending -> paid
done:
  ok
`));

    expect(diagnostics).toContainEqual(expect.objectContaining({ code: "UNKNOWN_STATE_ENTITY" }));
  });

  it("reports transitions that use undeclared states", () => {
    const diagnostics = checkUSL(parseUSL(`
spec BadTransition v0.1:
goal:
  ok
entity Order:
state Order:
  states: pending | paid
  cancelled -> paid
done:
  ok
`));

    expect(diagnostics).toContainEqual(expect.objectContaining({ code: "UNKNOWN_STATE" }));
  });

  it("warns when a rule has no related test", () => {
    const diagnostics = checkUSL(parseUSL(`
spec UntestedRule v0.1:
goal:
  ok
rule:
  must encrypt private payload
test unrelated:
  given user exists
  when user logs in
  then session is created
done:
  ok
`));

    expect(diagnostics).toContainEqual(expect.objectContaining({ code: "RULE_WITHOUT_TEST", severity: "warning" }));
  });
});
