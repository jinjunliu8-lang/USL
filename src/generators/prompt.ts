import { USLDocument } from "../types.js";

export function generateAgentPrompt(document: USLDocument): string {
  const lines: string[] = [];
  const title = document.spec ? `${document.spec.name}${document.spec.version ? ` ${document.spec.version}` : ""}` : "Untitled USL Spec";

  lines.push(`# AI Coding Control Prompt: ${title}`);
  lines.push("");
  lines.push("你是一个软件工程 Agent。下面的 USL 不是普通聊天需求，而是实现控制规格。");
  lines.push("");
  lines.push("执行要求：");
  lines.push("- 严格按照目标、对象、状态、流程、规则、错误码、测试、修改边界和完成标准实现。");
  lines.push("- 不得把未声明的行为当作默认需求自行扩展。");
  lines.push("- 不得修改 `must_not_modify` 中的路径，不得为了通过测试而绕开规则。");
  lines.push("- 每条 `rule` 都必须在实现、测试或完成说明中得到体现。");
  lines.push("- `test` 和 `done` 是验收标准；没有满足它们就不算完成。");
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

  lines.push("## 执行完成前自检");
  lines.push("");
  lines.push("- 已逐条核对 `rule`，没有违反 MUST/MUST NOT。");
  lines.push("- 已执行或说明所有 `test` 的验证方式。");
  lines.push("- 已确认修改没有超出 `limit`。");
  lines.push("- 已按 `done` 判断功能完成，而不是只按代码生成完成。");

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
