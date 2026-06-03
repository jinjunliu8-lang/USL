import { Diagnostic, USLDocument } from "./types.js";

const COMMON_WORDS = new Set([
  "User",
  "System",
  "AI",
  "Agent",
  "Codex",
  "API",
  "JWT",
  "Email",
  "Code",
  "MUST",
  "WHEN",
  "THEN",
  "ELSE",
  "GIVEN"
]);

export function checkUSL(document: USLDocument): Diagnostic[] {
  const diagnostics: Diagnostic[] = [...document.diagnostics];

  if (!document.spec) {
    diagnostics.push({
      severity: "error",
      code: "MISSING_SPEC",
      message: "Document must include a spec block."
    });
  }

  if (!document.goal) {
    diagnostics.push({
      severity: "error",
      code: "MISSING_GOAL",
      message: "Document must include a goal block."
    });
  }

  if (!document.done) {
    diagnostics.push({
      severity: "error",
      code: "MISSING_DONE",
      message: "Document must include a done block."
    });
  }

  const entityNames = new Set(document.entities.map((entity) => entity.name));
  const actorNames = new Set(document.actors.map((actor) => actor.name));
  const knownObjectNames = new Set([...entityNames, ...actorNames, ...COMMON_WORDS]);
  const errorCodes = new Set(document.errors.map((error) => error.code));

  for (const state of document.states) {
    if (!entityNames.has(state.entity)) {
      diagnostics.push({
        severity: "error",
        code: "UNKNOWN_STATE_ENTITY",
        message: `State machine references undefined entity "${state.entity}".`,
        location: state.location
      });
    }

    for (const transition of state.transitions) {
      if (!state.states.includes(transition.from) || !state.states.includes(transition.to)) {
        diagnostics.push({
          severity: "error",
          code: "UNKNOWN_STATE",
          message: `State transition "${transition.from} -> ${transition.to}" references an undeclared state.`,
          location: transition.location
        });
      }
    }
  }

  for (const flow of document.flows) {
    const referencedEntities = extractReferencedObjects(flow, knownObjectNames, errorCodes);
    flow.referencedEntities = referencedEntities;

    for (const entity of referencedEntities) {
      if (!knownObjectNames.has(entity)) {
        diagnostics.push({
          severity: "error",
          code: "UNKNOWN_FLOW_ENTITY",
          message: `Flow "${flow.name}" references undefined entity or actor "${entity}".`,
          location: flow.location
        });
      }
    }

    for (const code of flow.referencedErrors) {
      if (!errorCodes.has(code)) {
        diagnostics.push({
          severity: "error",
          code: "UNKNOWN_ERROR_CODE",
          message: `Flow "${flow.name}" rejects undefined error code "${code}".`,
          location: flow.location
        });
      }
    }
  }

  for (const rule of document.rules) {
    if (!hasRelatedTest(rule.text, document)) {
      diagnostics.push({
        severity: "warning",
        code: "RULE_WITHOUT_TEST",
        message: `Rule "${rule.text}" does not appear to have a related test.`,
        location: rule.location
      });
    }
  }

  return diagnostics;
}

function extractReferencedObjects(
  flow: USLDocument["flows"][number],
  knownObjectNames: Set<string>,
  errorCodes: Set<string>
): string[] {
  const texts = [...flow.when, ...flow.conditions, ...flow.then, ...flow.else];
  const found = new Set<string>();

  for (const text of texts) {
    for (const name of knownObjectNames) {
      const pattern = new RegExp(`\\b${escapeRegExp(name)}\\b`);
      if (pattern.test(text)) {
        found.add(name);
      }
    }

    for (const match of text.matchAll(/\b([A-Z][A-Za-z0-9_]{2,})\b/g)) {
      const candidate = match[1];
      if (!COMMON_WORDS.has(candidate) && !errorCodes.has(candidate) && !isAllCaps(candidate)) {
        found.add(candidate);
      }
    }
  }

  return [...found].filter((name) => !COMMON_WORDS.has(name));
}

function hasRelatedTest(ruleText: string, document: USLDocument): boolean {
  const ruleTokens = tokenize(ruleText);
  if (ruleTokens.length === 0) {
    return true;
  }

  const testText = document.tests
    .map((test) => [test.name, ...test.given, ...test.when, ...test.then].join(" "))
    .join(" ");
  const testTokens = new Set(tokenize(testText));

  return ruleTokens.some((token) => testTokens.has(token));
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9_\u4e00-\u9fa5]+/u)
    .filter((token) => token.length >= 4)
    .filter((token) => !["must", "should", "system", "user", "with", "after", "before"].includes(token));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isAllCaps(value: string): boolean {
  return /^[A-Z0-9_]+$/.test(value);
}
