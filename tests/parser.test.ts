import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseUSL } from "../src/parser.js";

describe("parseUSL", () => {
  it("parses the email login example", () => {
    const input = readFileSync("examples/email_login.usl", "utf8");
    const document = parseUSL(input);

    expect(document.spec?.name).toBe("EmailCodeLogin");
    expect(document.spec?.version).toBe("v0.1");
    expect(document.goal?.text[0]).toContain("邮箱验证码登录");
    expect(document.entities.map((entity) => entity.name)).toContain("EmailCode");
    expect(document.flows.map((flow) => flow.name)).toContain("VerifyCode");
    expect(document.tests.map((test) => test.name)).toContain("valid_code_login");
  });

  it("parses Chinese content", () => {
    const document = parseUSL(`
spec ChineseSpec v0.1:
goal:
  这是中文目标。
done:
  完成即可
`);

    expect(document.goal?.text).toEqual(["这是中文目标。"]);
  });

  it("ignores empty lines and comments", () => {
    const document = parseUSL(`
# comment
spec Commented v0.1:

goal:
  useful # inline comment

done:
  ok
`);

    expect(document.spec?.name).toBe("Commented");
    expect(document.goal?.text).toEqual(["useful"]);
  });

  it("reports unknown top-level blocks", () => {
    const document = parseUSL(`
spec UnknownBlock v0.1:
goal:
  ok
unknown:
  nope
done:
  ok
`);

    expect(document.diagnostics).toContainEqual(
      expect.objectContaining({
        severity: "error",
        code: "UNKNOWN_BLOCK"
      })
    );
  });
});
