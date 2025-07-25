import * as vscode from "vscode";
import { createDiagnosticCollection, checkDocumentForIssues } from "./diagnostics";

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
  diagnosticCollection = createDiagnosticCollection();
  context.subscriptions.push(diagnosticCollection);

  // Check open document on activation
  if (vscode.window.activeTextEditor) {
    checkDocument(vscode.window.activeTextEditor.document);
  }

  // Check when document changes
  vscode.workspace.onDidChangeTextDocument((event) => {
    checkDocument(event.document);
  });

  // Check when switching between documents
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      checkDocument(editor.document);
    }
  });
}

function checkDocument(document: vscode.TextDocument) {
  const diagnostics = checkDocumentForIssues(document);
  diagnosticCollection.set(document.uri, diagnostics);
}

export function deactivate() {
  if (diagnosticCollection) {
    diagnosticCollection.dispose();
  }
}
