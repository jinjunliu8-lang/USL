import { USLDocument } from "./types.js";

export function explainUSL(document: USLDocument): string {
  const specName = document.spec?.name ?? "未命名规格";
  const parts: string[] = [];

  parts.push(`# ${specName} 的 USL 控制说明`);
  parts.push("");
  parts.push("这份 USL 用来控制 AI 实现过程：它把目标、对象、流程、规则、测试、边界和完成标准从聊天记录里提取出来，变成 Agent 必须遵守的规格。");
  parts.push("");

  if (document.goal?.text.length) {
    parts.push(`目标：${document.goal.text.join(" ")}`);
  } else {
    parts.push("目标：未声明。");
  }

  parts.push("");
  parts.push(`控制面：${document.actors.length} 个参与者、${document.entities.length} 个对象、${document.flows.length} 个流程、${document.rules.length} 条规则、${document.tests.length} 个验收测试。`);

  if (document.entities.length > 0) {
    parts.push("");
    parts.push("AI 需要理解的对象包括：" + document.entities.map((entity) => entity.name).join("、") + "。");
  }

  if (document.flows.length > 0) {
    parts.push("");
    parts.push("AI 需要实现或保持的流程包括：" + document.flows.map((flow) => flow.name).join("、") + "。");
  }

  if (document.rules.length > 0) {
    parts.push("");
    parts.push("关键规则包括：" + document.rules.map((rule) => `${rule.kind === "must_not" ? "禁止" : rule.kind === "must" ? "必须" : "规则"} ${rule.text}`).join("；") + "。");
  }

  if (document.limit?.mayModify.length || document.limit?.mustNotModify.length) {
    parts.push("");
    const may = document.limit.mayModify.length ? `允许修改：${document.limit.mayModify.join("、")}` : "未声明允许修改范围";
    const mustNot = document.limit.mustNotModify.length ? `禁止修改：${document.limit.mustNotModify.join("、")}` : "未声明禁止修改范围";
    parts.push(`修改边界：${may}；${mustNot}。`);
  }

  if (document.done?.items.length) {
    parts.push("");
    parts.push("完成标准：" + document.done.items.join("；") + "。");
  }

  return parts.join("\n") + "\n";
}
