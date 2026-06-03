import {
  Diagnostic,
  FlowDef,
  SourceLocation,
  TestCaseDef,
  TOP_LEVEL_KEYWORDS,
  TopLevelKeyword,
  USLDocument
} from "./types.js";

interface ParsedLine {
  number: number;
  indent: number;
  text: string;
}

interface Block {
  keyword: string;
  name?: string;
  header: string;
  location: SourceLocation;
  lines: ParsedLine[];
}

const KEYWORD_SET = new Set<string>(TOP_LEVEL_KEYWORDS);

export function parseUSL(input: string, source?: string): USLDocument {
  const diagnostics: Diagnostic[] = [];
  const document: USLDocument = {
    source,
    actors: [],
    entities: [],
    states: [],
    flows: [],
    rules: [],
    errors: [],
    tests: [],
    diagnostics
  };

  const blocks = collectBlocks(input, diagnostics);

  for (const block of blocks) {
    if (!KEYWORD_SET.has(block.keyword)) {
      diagnostics.push({
        severity: "error",
        code: "UNKNOWN_BLOCK",
        message: `Unknown top-level block "${block.keyword}".`,
        location: block.location
      });
      continue;
    }

    switch (block.keyword as TopLevelKeyword) {
      case "spec":
        document.spec = parseSpec(block, diagnostics);
        break;
      case "goal":
        document.goal = {
          text: block.lines.map((line) => line.text),
          location: block.location
        };
        break;
      case "actor":
        document.actors.push({
          name: requireName(block, diagnostics),
          properties: parseProperties(block.lines),
          notes: parseNotes(block.lines),
          location: block.location
        });
        break;
      case "entity":
        document.entities.push({
          name: requireName(block, diagnostics),
          fields: parseProperties(block.lines),
          notes: parseNotes(block.lines),
          location: block.location
        });
        break;
      case "state":
        document.states.push(parseState(block, diagnostics));
        break;
      case "flow":
        document.flows.push(parseFlow(block, diagnostics));
        break;
      case "rule":
        document.rules.push(...parseRules(block));
        break;
      case "error":
        document.errors.push({
          code: requireName(block, diagnostics),
          when: getProperty(block.lines, "when"),
          message: getProperty(block.lines, "message"),
          details: parseNotes(block.lines),
          location: block.location
        });
        break;
      case "test":
        document.tests.push(parseTest(block, diagnostics));
        break;
      case "limit":
        document.limit = parseLimit(block);
        break;
      case "done":
        document.done = {
          items: block.lines.map((line) => normalizeListItem(line.text)),
          location: block.location
        };
        break;
    }
  }

  return document;
}

function collectBlocks(input: string, diagnostics: Diagnostic[]): Block[] {
  const lines = input.split(/\r?\n/);
  const blocks: Block[] = [];
  let current: Block | undefined;

  lines.forEach((rawLine, index) => {
    const withoutComment = stripComment(rawLine);
    if (withoutComment.trim().length === 0) {
      return;
    }

    const indent = countIndent(withoutComment);
    const text = withoutComment.trim();
    const topLevelMatch = indent === 0 ? text.match(/^([A-Za-z_][\w-]*)(?:\s+([^:]+?))?\s*:\s*$/) : null;

    if (topLevelMatch) {
      current = {
        keyword: topLevelMatch[1].toLowerCase(),
        name: topLevelMatch[2]?.trim(),
        header: text,
        location: { line: index + 1, column: 1 },
        lines: []
      };
      blocks.push(current);
      return;
    }

    if (!current) {
      diagnostics.push({
        severity: "error",
        code: "CONTENT_OUTSIDE_BLOCK",
        message: "Content must be placed inside a top-level block.",
        location: { line: index + 1, column: indent + 1 }
      });
      return;
    }

    current.lines.push({
      number: index + 1,
      indent,
      text
    });
  });

  return blocks;
}

function parseSpec(block: Block, diagnostics: Diagnostic[]) {
  const name = requireName(block, diagnostics);
  const versionMatch = block.name?.match(/\s+(v[0-9][\w.-]*)$/i);

  return {
    name: versionMatch ? block.name!.slice(0, versionMatch.index).trim() : name,
    version: versionMatch?.[1],
    location: block.location
  };
}

function parseState(block: Block, diagnostics: Diagnostic[]) {
  const entity = requireName(block, diagnostics);
  const states = new Set<string>();
  const transitions = [];

  for (const line of block.lines) {
    const statesMatch = line.text.match(/^states\s*:\s*(.+)$/i);
    if (statesMatch) {
      for (const state of statesMatch[1].split("|").map((item) => item.trim()).filter(Boolean)) {
        states.add(state);
      }
      continue;
    }

    const match = line.text.match(/^([A-Za-z_][\w-]*)\s*->\s*([A-Za-z_][\w-]*)$/);
    if (!match) {
      diagnostics.push({
        severity: "error",
        code: "INVALID_STATE_TRANSITION",
        message: `Invalid state transition "${line.text}". Expected "states: a | b" or "from -> to".`,
        location: { line: line.number, column: line.indent + 1 }
      });
      continue;
    }
    const [, from, to] = match;
    transitions.push({
      from,
      to,
      location: { line: line.number, column: line.indent + 1 }
    });
  }

  if (states.size === 0) {
    for (const transition of transitions) {
      states.add(transition.from);
      states.add(transition.to);
    }
  }

  return {
    entity,
    states: [...states],
    transitions,
    location: block.location
  };
}

function parseFlow(block: Block, diagnostics: Diagnostic[]): FlowDef {
  const name = requireName(block, diagnostics);
  const flow: FlowDef = {
    name,
    when: [],
    conditions: [],
    then: [],
    else: [],
    steps: [],
    referencedEntities: [],
    referencedErrors: [],
    location: block.location
  };

  let currentTarget: "when" | "conditions" | "then" | "else" | undefined;
  for (const line of block.lines) {
    const classified = classifyFlowLine(line.text);
    flow.steps.push({
      keyword: classified.keyword,
      text: classified.text,
      location: { line: line.number, column: line.indent + 1 }
    });

    if (classified.keyword === "when") {
      currentTarget = "when";
      flow.when.push(classified.text);
    } else if (classified.keyword === "if") {
      currentTarget = "conditions";
      flow.conditions.push(classified.text);
    } else if (classified.keyword === "then") {
      currentTarget = "then";
      flow.then.push(classified.text);
    } else if (classified.keyword === "else") {
      currentTarget = "else";
      if (classified.text.length > 0) {
        flow.else.push(classified.text);
      }
    } else if (classified.keyword === "and" && currentTarget) {
      flow[currentTarget].push(classified.text);
    } else if (classified.keyword === "raw") {
      flow.then.push(classified.text);
    }
  }

  flow.referencedErrors = extractRejectedErrors(flow);
  return flow;
}

function classifyFlowLine(text: string): FlowDef["steps"][number] {
  const match = text.match(/^(when|if|then|else|and)\b\s*(.*)$/i);
  if (!match) {
    return { keyword: "raw", text };
  }

  return {
    keyword: match[1].toLowerCase() as FlowDef["steps"][number]["keyword"],
    text: match[2].trim()
  };
}

function parseRules(block: Block) {
  return block.lines.map((line) => {
    const mustNot = line.text.match(/^must\s+not\b\s*(.*)$/i);
    if (mustNot) {
      return {
        kind: "must_not" as const,
        text: mustNot[1].trim(),
        location: { line: line.number, column: line.indent + 1 }
      };
    }

    const must = line.text.match(/^must\b\s*(.*)$/i);
    if (must) {
      return {
        kind: "must" as const,
        text: must[1].trim(),
        location: { line: line.number, column: line.indent + 1 }
      };
    }

    return {
      kind: "raw" as const,
      text: normalizeListItem(line.text),
      location: { line: line.number, column: line.indent + 1 }
    };
  });
}

function parseTest(block: Block, diagnostics: Diagnostic[]): TestCaseDef {
  const name = requireName(block, diagnostics);
  const test: TestCaseDef = {
    name,
    given: [],
    when: [],
    then: [],
    steps: [],
    location: block.location
  };

  let currentTarget: "given" | "when" | "then" | undefined;
  for (const line of block.lines) {
    const classified = classifyTestLine(line.text);
    test.steps.push({
      keyword: classified.keyword,
      text: classified.text,
      location: { line: line.number, column: line.indent + 1 }
    });

    if (classified.keyword === "given") {
      currentTarget = "given";
      test.given.push(classified.text);
    } else if (classified.keyword === "when") {
      currentTarget = "when";
      test.when.push(classified.text);
    } else if (classified.keyword === "then") {
      currentTarget = "then";
      test.then.push(classified.text);
    } else if (classified.keyword === "and" && currentTarget) {
      test[currentTarget].push(classified.text);
    } else if (classified.keyword === "raw") {
      test.then.push(classified.text);
    }
  }

  return test;
}

function classifyTestLine(text: string): TestCaseDef["steps"][number] {
  const match = text.match(/^(given|when|then|and)\b\s*(.*)$/i);
  if (!match) {
    return { keyword: "raw", text };
  }

  return {
    keyword: match[1].toLowerCase() as TestCaseDef["steps"][number]["keyword"],
    text: match[2].trim()
  };
}

function parseLimit(block: Block) {
  const mayModify: string[] = [];
  const mustNotModify: string[] = [];
  const notes: string[] = [];
  let target: "may" | "not" | undefined;

  for (const line of block.lines) {
    if (/^may_modify\s*:/i.test(line.text) || /^may modify\s*:/i.test(line.text)) {
      target = "may";
      continue;
    }
    if (/^must_not_modify\s*:/i.test(line.text) || /^must not modify\s*:/i.test(line.text)) {
      target = "not";
      continue;
    }

    const item = normalizeListItem(line.text);
    if (target === "may") {
      mayModify.push(item);
    } else if (target === "not") {
      mustNotModify.push(item);
    } else {
      notes.push(item);
    }
  }

  return {
    mayModify,
    mustNotModify,
    notes,
    location: block.location
  };
}

function parseProperties(lines: ParsedLine[]): Record<string, string> {
  const properties: Record<string, string> = {};
  for (const line of lines) {
    const match = normalizeListItem(line.text).match(/^([A-Za-z_][\w-]*)\s*:\s*(.+)$/);
    if (match) {
      properties[match[1]] = match[2].trim();
    }
  }
  return properties;
}

function parseNotes(lines: ParsedLine[]): string[] {
  return lines
    .map((line) => normalizeListItem(line.text))
    .filter((line) => !/^([A-Za-z_][\w-]*)\s*:\s*(.+)$/.test(line));
}

function getProperty(lines: ParsedLine[], key: string): string | undefined {
  const lowerKey = key.toLowerCase();
  for (const line of lines) {
    const normalized = normalizeListItem(line.text);
    const match = normalized.match(/^([A-Za-z_][\w-]*)\s*:\s*(.+)$/);
    if (match?.[1].toLowerCase() === lowerKey) {
      return match[2].trim();
    }
  }
  return undefined;
}

function extractRejectedErrors(flow: FlowDef): string[] {
  const allTexts = [...flow.then, ...flow.else];
  const errors = new Set<string>();

  for (const text of allTexts) {
    const match = text.match(/\breject(?:s|ed)?\s+([A-Z][A-Z0-9_]*)\b/);
    if (match) {
      errors.add(match[1]);
    }
    const errorMatch = text.match(/\berror\s*=\s*([A-Z][A-Z0-9_]*)\b/);
    if (errorMatch) {
      errors.add(errorMatch[1]);
    }
  }

  return [...errors];
}

function requireName(block: Block, diagnostics: Diagnostic[]): string {
  if (block.name && block.name.length > 0) {
    return block.name;
  }

  diagnostics.push({
    severity: "error",
    code: "MISSING_BLOCK_NAME",
    message: `Block "${block.keyword}" requires a name.`,
    location: block.location
  });
  return "";
}

function stripComment(line: string): string {
  const index = line.indexOf("#");
  return index === -1 ? line : line.slice(0, index);
}

function countIndent(line: string): number {
  const match = line.match(/^\s*/);
  return match?.[0].length ?? 0;
}

function normalizeListItem(text: string): string {
  return text.replace(/^-\s*/, "").trim();
}
