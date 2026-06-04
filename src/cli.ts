#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Command } from "commander";
import { checkUSL } from "./checker.js";
import { explainUSL } from "./explain.js";
import { generateAgentPrompt } from "./generators/prompt.js";
import { parseUSL } from "./parser.js";
import { Diagnostic } from "./types.js";

const program = new Command();

program
  .name("usl")
  .description("USL v0.1 CLI for AI coding control specs")
  .version("0.1.0");

program
  .command("parse")
  .argument("<file>", "USL file to parse")
  .description("Parse a .usl file and print JSON AST")
  .action(async (file) => {
    const document = await loadDocument(file);
    process.stdout.write(JSON.stringify(document, null, 2) + "\n");
    process.exitCode = hasErrors(document.diagnostics) ? 1 : 0;
  });

program
  .command("check")
  .argument("<file>", "USL file to check")
  .description("Run syntax and semantic checks")
  .action(async (file) => {
    const document = await loadDocument(file);
    const diagnostics = checkUSL(document);
    printDiagnostics(diagnostics);
    process.exitCode = hasErrors(diagnostics) ? 1 : 0;
  });

program
  .command("gen-prompt")
  .argument("<file>", "USL file to convert")
  .description("Generate an AI Agent execution prompt from a USL control spec")
  .action(async (file) => {
    const document = await loadDocument(file);
    const diagnostics = checkUSL(document);
    const errors = diagnostics.filter((diagnostic) => diagnostic.severity === "error");
    if (errors.length > 0) {
      printDiagnostics(diagnostics);
      process.exitCode = 1;
      return;
    }
    process.stdout.write(generateAgentPrompt(document));
  });

program
  .command("explain")
  .argument("<file>", "USL file to explain")
  .description("Explain in Chinese how a .usl spec controls AI implementation")
  .action(async (file) => {
    const document = await loadDocument(file);
    process.stdout.write(explainUSL(document));
    process.exitCode = hasErrors(document.diagnostics) ? 1 : 0;
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`error: ${message}\n`);
  process.exitCode = 1;
});

async function loadDocument(file: string) {
  const absolutePath = resolve(process.cwd(), file);
  const input = await readFile(absolutePath, "utf8");
  return parseUSL(input, absolutePath);
}

function printDiagnostics(diagnostics: Diagnostic[]): void {
  if (diagnostics.length === 0) {
    process.stdout.write("No diagnostics.\n");
    return;
  }

  for (const diagnostic of diagnostics) {
    const location = diagnostic.location ? `${diagnostic.location.line}:${diagnostic.location.column} ` : "";
    const output = `${diagnostic.severity.toUpperCase()} ${location}${diagnostic.code}: ${diagnostic.message}\n`;
    if (diagnostic.severity === "error") {
      process.stderr.write(output);
    } else {
      process.stdout.write(output);
    }
  }
}

function hasErrors(diagnostics: Diagnostic[]): boolean {
  return diagnostics.some((diagnostic) => diagnostic.severity === "error");
}
