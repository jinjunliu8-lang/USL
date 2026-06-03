import { USLDocument } from "./types.js";

export function explainUSL(document: USLDocument): string {
  const specName = document.spec?.name ?? "未命名规格";
  const parts: string[] = [];

  parts.push(`# ${specName} 的 USL 解释`);
  parts.push("");

  if (document.goal?.text.length) {
    parts.push(`这个规格的目标是：${document.goal.text.join(" ")}`);
  } else {
    parts.push("这个规格还没有声明目标。");
  }

  parts.push("");
  parts.push(`它定义了 ${document.actors.length} 个参与者、${document.entities.length} 个业务对象、${document.flows.length} 个流程、${document.rules.length} 条规则和 ${document.tests.length} 个验收测试。`);

  if (document.entities.length > 0) {
    parts.push("");
    parts.push("业务对象包括：" + document.entities.map((entity) => entity.name).join("、") + "。");
  }

  if (document.flows.length > 0) {
    parts.push("");
    parts.push("主要流程包括：" + document.flows.map((flow) => flow.name).join("、") + "。");
  }

  if (document.done?.items.length) {
    parts.push("");
    parts.push("完成标准是：" + document.done.items.join("；") + "。");
  }

  return parts.join("\n") + "\n";
}
