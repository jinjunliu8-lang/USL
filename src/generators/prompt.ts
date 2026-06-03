import { USLDocument } from "../types.js";

export function generateAgentPrompt(document: USLDocument): string {
  const lines: string[] = [];
  const title = document.spec ? `${document.spec.name}${document.spec.version ? ` ${document.spec.version}` : ""}` : "Untitled USL Spec";

  lines.push(`# Agent Implementation Prompt: ${title}`);
  lines.push("");
  lines.push("你是一个软件工程 Agent。请严格按照下面的 USL 规格实现功能，不要超出限制范围。");
  lines.push("");

  section(lines, "功能目标", document.goal?.text ?? []);

  section(
    lines,
    "业务对象",
    document.entities.map((entity) => {
      const fields = Object.entries(entity.fields).map(([key, value]) => `${key}: ${value}`);
      return [`${entity.name}:`, ...fields.map((field) => `  - ${field}`), ...entity.notes.map((note) => `  - ${note}`)].join("\n");
    })
  );

  section(
    lines,
    "状态机",
    document.states.map((state) => {
      const transitions = state.transitions.map((transition) => `  - ${transition.from} -> ${transition.to}`);
      return [`${state.entity}:`, ...transitions].join("\n");
    })
  );

  section(
    lines,
    "流程",
    document.flows.map((flow) => {
      const body = [
        ...flow.when.map((text) => `  - WHEN ${text}`),
        ...flow.conditions.map((text) => `  - IF ${text}`),
        ...flow.then.map((text) => `  - THEN ${text}`),
        ...flow.else.map((text) => `  - ELSE ${text}`)
      ];
      return [`${flow.name}:`, ...body].join("\n");
    })
  );

  section(
    lines,
    "必须遵守的规则",
    document.rules.map((rule) => `${rule.kind === "must_not" ? "MUST NOT" : rule.kind === "must" ? "MUST" : "-"} ${rule.text}`)
  );

  section(
    lines,
    "错误码",
    document.errors.map((error) => {
      const details = [];
      if (error.when) details.push(`when: ${error.when}`);
      if (error.message) details.push(`message: ${error.message}`);
      details.push(...error.details);
      return [`${error.code}:`, ...details.map((detail) => `  - ${detail}`)].join("\n");
    })
  );

  section(
    lines,
    "验收测试",
    document.tests.map((test) => {
      const body = [
        ...test.given.map((text) => `  - GIVEN ${text}`),
        ...test.when.map((text) => `  - WHEN ${text}`),
        ...test.then.map((text) => `  - THEN ${text}`)
      ];
      return [`${test.name}:`, ...body].join("\n");
    })
  );

  section(lines, "允许修改范围", document.limit?.mayModify ?? []);
  section(lines, "禁止修改范围", document.limit?.mustNotModify ?? []);
  section(lines, "完成标准", document.done?.items ?? []);

  return lines.join("\n").trimEnd() + "\n";
}

function section(lines: string[], title: string, items: string[]): void {
  lines.push(`## ${title}`);
  lines.push("");
  if (items.length === 0) {
    lines.push("- 未声明");
  } else {
    for (const item of items) {
      if (item.includes("\n")) {
        lines.push(item);
      } else {
        lines.push(`- ${item}`);
      }
    }
  }
  lines.push("");
}
