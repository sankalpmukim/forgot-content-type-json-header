import * as vscode from "vscode";

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
  diagnosticCollection =
    vscode.languages.createDiagnosticCollection("fetch-content-type");
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
  // Only check JavaScript/TypeScript files
  const supportedLanguages = [
    "javascript",
    "typescript",
    "javascriptreact",
    "typescriptreact",
  ];
  if (!supportedLanguages.includes(document.languageId)) {
    return;
  }

  const diagnostics: vscode.Diagnostic[] = [];
  const text = document.getText();

  // Find all fetch calls
  const fetchRegex = /fetch\s*\(\s*[^,]+\s*,\s*\{([^}]+)\}/g;
  let match;

  while ((match = fetchRegex.exec(text)) !== null) {
    const fetchCallContent = match[1];
    const hasJsonStringify = /JSON\.stringify\s*\(/.test(fetchCallContent);

    if (hasJsonStringify) {
      // Check if Content-Type is set to application/json
      const hasCorrectContentType =
        /['"`]content-type['"`]\s*:\s*['"`]application\/json['"`]/i.test(
          fetchCallContent
        );

      if (!hasCorrectContentType) {
        // Find the position of JSON.stringify in the document
        const jsonStringifyMatch = /JSON\.stringify\s*\(/.exec(
          fetchCallContent
        );
        if (jsonStringifyMatch) {
          const absoluteIndex =
            match.index +
            match[0].indexOf(fetchCallContent) +
            jsonStringifyMatch.index;
          const position = document.positionAt(absoluteIndex);
          const endPosition = document.positionAt(
            absoluteIndex + jsonStringifyMatch[0].length - 1
          );

          const diagnostic = new vscode.Diagnostic(
            new vscode.Range(position, endPosition),
            'Using JSON.stringify() without "Content-Type": "application/json" header',
            vscode.DiagnosticSeverity.Warning
          );

          diagnostic.source = "fetch-content-type-checker";
          diagnostics.push(diagnostic);
        }
      }
    }
  }

  diagnosticCollection.set(document.uri, diagnostics);
}

export function deactivate() {
  if (diagnosticCollection) {
    diagnosticCollection.dispose();
  }
}
