export type DiagnosticSeverity = "error" | "warning" | "info";

export interface SourceLocation {
  line: number;
  column: number;
}

export interface Diagnostic {
  severity: DiagnosticSeverity;
  code: string;
  message: string;
  location?: SourceLocation;
}

export interface SpecBlock {
  name: string;
  version?: string;
  location?: SourceLocation;
}

export interface GoalBlock {
  text: string[];
  location?: SourceLocation;
}

export interface ActorDef {
  name: string;
  properties: Record<string, string>;
  notes: string[];
  location?: SourceLocation;
}

export interface EntityDef {
  name: string;
  fields: Record<string, string>;
  notes: string[];
  location?: SourceLocation;
}

export interface StateMachineDef {
  entity: string;
  states: string[];
  transitions: Array<{
    from: string;
    to: string;
    location?: SourceLocation;
  }>;
  location?: SourceLocation;
}

export interface FlowDef {
  name: string;
  when: string[];
  conditions: string[];
  then: string[];
  else: string[];
  steps: Array<{
    keyword: "when" | "if" | "then" | "else" | "and" | "raw";
    text: string;
    location?: SourceLocation;
  }>;
  referencedEntities: string[];
  referencedErrors: string[];
  location?: SourceLocation;
}

export interface RuleDef {
  kind: "must" | "must_not" | "raw";
  text: string;
  location?: SourceLocation;
}

export interface ErrorDef {
  code: string;
  when?: string;
  message?: string;
  details: string[];
  location?: SourceLocation;
}

export interface TestCaseDef {
  name: string;
  given: string[];
  when: string[];
  then: string[];
  steps: Array<{
    keyword: "given" | "when" | "then" | "and" | "raw";
    text: string;
    location?: SourceLocation;
  }>;
  location?: SourceLocation;
}

export interface LimitBlock {
  mayModify: string[];
  mustNotModify: string[];
  notes: string[];
  location?: SourceLocation;
}

export interface DoneBlock {
  items: string[];
  location?: SourceLocation;
}

export interface USLDocument {
  source?: string;
  spec?: SpecBlock;
  goal?: GoalBlock;
  actors: ActorDef[];
  entities: EntityDef[];
  states: StateMachineDef[];
  flows: FlowDef[];
  rules: RuleDef[];
  errors: ErrorDef[];
  tests: TestCaseDef[];
  limit?: LimitBlock;
  done?: DoneBlock;
  diagnostics: Diagnostic[];
}

export const TOP_LEVEL_KEYWORDS = [
  "spec",
  "goal",
  "actor",
  "entity",
  "state",
  "flow",
  "rule",
  "error",
  "test",
  "limit",
  "done"
] as const;

export type TopLevelKeyword = (typeof TOP_LEVEL_KEYWORDS)[number];
