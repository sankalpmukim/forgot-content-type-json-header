## Problem statement

Can you make a vs code extension that does the following (simple implementation is preferred)
If a js/ts/jsx/tsx/cjs/mjs etc file is open, and the user is making a fetch function call, and while calling, they are forgetting to apply the "Content-Type":"application/json" header, but are still doing body: JSON.stringify() in the same call... then give them squiggly line errors or some other obvious notification or something. Whatever is the simplest to implement but still obvious

### recommended package.json kinda

```json
{
  "name": "fetch-content-type-checker",
  "displayName": "Fetch Content-Type Checker",
  "description": "Warns when using JSON.stringify() without Content-Type header in fetch calls",
  "version": "0.0.1",
  "engines": {
    "vscode": "^1.74.0"
  },
  "categories": ["Linters"],
  "activationEvents": [
    "onLanguage:javascript",
    "onLanguage:typescript",
    "onLanguage:javascriptreact",
    "onLanguage:typescriptreact"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": []
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./"
  },
  "devDependencies": {
    "@types/vscode": "^1.74.0",
    "@types/node": "16.x",
    "typescript": "^4.9.4"
  }
}
```

### recommended extention.ts

```ts
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
```

### recommended tsconfig.json

```
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "ES2020",
        "outDir": "out",
        "lib": [
            "ES2020"
        ],
        "sourceMap": true,
        "rootDir": "src",
        "strict": true
    },
    "exclude": [
        "node_modules",
        ".vscode-test"
    ]
}
```

### How to install and use and stuff

I'll create a VS Code extension that detects when you're using `JSON.stringify()` in a fetch body without the proper Content-Type header. Here's a simple implementation:This VS Code extension will:

1. **Activate** for JavaScript/TypeScript files (js, ts, jsx, tsx, etc.)
2. **Monitor** your code in real-time as you type
3. **Detect** fetch calls that use `JSON.stringify()` in the body
4. **Check** if the Content-Type header is set to "application/json"
5. **Show** yellow squiggly lines under `JSON.stringify` with a warning message if the header is missing

## How to install and use:

1. Create a new folder for your extension
2. Save these three files in the appropriate structure:
   - `package.json` (root)
   - `src/extension.ts`
   - `tsconfig.json` (root)
3. Run `npm install` to install dependencies
4. Run `npm run compile` to build
5. Press F5 in VS Code to test the extension

## Example of what it catches:

```javascript
// ❌ This will show a warning
fetch("/api/data", {
  method: "POST",
  body: JSON.stringify(data), // <- squiggly line here
});

// ✅ This won't show a warning
fetch("/api/data", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
});
```

The extension uses VS Code's diagnostic system to show the warnings, which is the simplest and most native way to display linting errors. The warnings will appear both as squiggly lines in the editor and in the Problems panel.
