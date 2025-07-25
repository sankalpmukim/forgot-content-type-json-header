import * as vscode from "vscode";
import {
  findFetchCalls,
  hasJsonStringify,
  hasCorrectContentType,
  findJsonStringifyPosition,
  calculateAbsolutePosition,
  isSupportedLanguage,
  type FetchCallMatch,
} from "./fetchDetector";

export const DIAGNOSTIC_SOURCE = "fetch-content-type-checker";
export const DIAGNOSTIC_MESSAGE =
  'Using JSON.stringify() without "Content-Type": "application/json" header';

export function createDiagnosticCollection(): vscode.DiagnosticCollection {
  return vscode.languages.createDiagnosticCollection("fetch-content-type");
}

export function shouldCheckDocument(document: vscode.TextDocument): boolean {
  return isSupportedLanguage(document.languageId);
}

export function createDiagnostic(
  document: vscode.TextDocument,
  fetchMatch: FetchCallMatch,
  jsonStringifyIndex: number,
  jsonStringifyLength: number
): vscode.Diagnostic {
  const absoluteIndex = calculateAbsolutePosition(fetchMatch, {
    index: jsonStringifyIndex,
    length: jsonStringifyLength,
  });

  const position = document.positionAt(absoluteIndex);
  const endPosition = document.positionAt(absoluteIndex + jsonStringifyLength - 1);

  const diagnostic = new vscode.Diagnostic(
    new vscode.Range(position, endPosition),
    DIAGNOSTIC_MESSAGE,
    vscode.DiagnosticSeverity.Warning
  );

  diagnostic.source = DIAGNOSTIC_SOURCE;
  return diagnostic;
}

export function checkDocumentForIssues(
  document: vscode.TextDocument
): vscode.Diagnostic[] {
  if (!shouldCheckDocument(document)) {
    return [];
  }

  const diagnostics: vscode.Diagnostic[] = [];
  const text = document.getText();
  const fetchCalls = findFetchCalls(text);

  for (const fetchMatch of fetchCalls) {
    if (hasJsonStringify(fetchMatch.content)) {
      if (!hasCorrectContentType(fetchMatch.content)) {
        const jsonStringifyMatch = findJsonStringifyPosition(fetchMatch.content);
        if (jsonStringifyMatch) {
          const diagnostic = createDiagnostic(
            document,
            fetchMatch,
            jsonStringifyMatch.index,
            jsonStringifyMatch.length
          );
          diagnostics.push(diagnostic);
        }
      }
    }
  }

  return diagnostics;
}