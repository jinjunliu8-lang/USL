import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const cli = ["tsx", "src/cli.ts"];

describe("CLI", () => {
  it("parse outputs valid JSON", () => {
    const result = spawnSync("npx", [...cli, "parse", "examples/email_login.usl"], {
      encoding: "utf8"
    });

    expect(result.status).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed.spec.name).toBe("EmailCodeLogin");
  });

  it("check succeeds for the valid example", () => {
    const result = spawnSync("npx", [...cli, "check", "examples/email_login.usl"], {
      encoding: "utf8"
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("No diagnostics.");
  });

  it("check succeeds for the order payment case study", () => {
    const result = spawnSync("npx", [...cli, "check", "examples/order_payment.usl"], {
      encoding: "utf8"
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("No diagnostics.");
  });

  it("check succeeds for the Chinese order payment case study", () => {
    const result = spawnSync("npx", [...cli, "check", "examples/order_payment.zh.usl"], {
      encoding: "utf8"
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("No diagnostics.");
  });

  it("check fails for an invalid spec", () => {
    const result = spawnSync("npx", [...cli, "check", "tests/fixtures/invalid.usl"], {
      encoding: "utf8"
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("MISSING_SPEC");
  });

  it("gen-prompt includes core sections", () => {
    const result = spawnSync("npx", [...cli, "gen-prompt", "examples/email_login.usl"], {
      encoding: "utf8"
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("## 功能目标");
    expect(result.stdout).toContain("## 必须遵守的规则");
    expect(result.stdout).toContain("## 验收测试");
    expect(result.stdout).toContain("## 完成标准");
  });
});
