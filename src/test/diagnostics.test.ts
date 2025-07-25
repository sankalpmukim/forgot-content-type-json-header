import * as assert from "assert";
import * as vscode from "vscode";

import {
  DIAGNOSTIC_MESSAGE,
  DIAGNOSTIC_SOURCE,
  checkDocumentForIssues,
  createDiagnostic,
  shouldCheckDocument,
} from "../diagnostics";

// Mock document helper
function createMockDocument(
  content: string,
  languageId: string = "javascript"
): vscode.TextDocument {
  return {
    getText: () => content,
    languageId: languageId,
    positionAt: (offset: number) => new vscode.Position(0, offset),
    uri: vscode.Uri.file("/test.js"),
  } as vscode.TextDocument;
}

suite("Diagnostics Tests", () => {
  suite("shouldCheckDocument", () => {
    test("should check supported languages", () => {
      const jsDoc = createMockDocument("", "javascript");
      const tsDoc = createMockDocument("", "typescript");
      const jsxDoc = createMockDocument("", "javascriptreact");
      const tsxDoc = createMockDocument("", "typescriptreact");

      assert.strictEqual(shouldCheckDocument(jsDoc), true);
      assert.strictEqual(shouldCheckDocument(tsDoc), true);
      assert.strictEqual(shouldCheckDocument(jsxDoc), true);
      assert.strictEqual(shouldCheckDocument(tsxDoc), true);
    });

    test("should not check unsupported languages", () => {
      const pyDoc = createMockDocument("", "python");
      const htmlDoc = createMockDocument("", "html");

      assert.strictEqual(shouldCheckDocument(pyDoc), false);
      assert.strictEqual(shouldCheckDocument(htmlDoc), false);
    });
  });

  suite("checkDocumentForIssues", () => {
    test("should return empty array for unsupported language", () => {
      const code = `fetch("/api", { body: JSON.stringify(data) });`;
      const doc = createMockDocument(code, "python");

      const diagnostics = checkDocumentForIssues(doc);
      assert.strictEqual(diagnostics.length, 0);
    });

    test("should detect fetch with JSON.stringify but no Content-Type", () => {
      const code = `fetch("/api/data", {
        method: "POST",
        body: JSON.stringify(data)
      });`;
      const doc = createMockDocument(code);

      const diagnostics = checkDocumentForIssues(doc);
      assert.strictEqual(diagnostics.length, 1);
      assert.strictEqual(diagnostics[0].message, DIAGNOSTIC_MESSAGE);
      assert.strictEqual(diagnostics[0].source, DIAGNOSTIC_SOURCE);
      assert.strictEqual(
        diagnostics[0].severity,
        vscode.DiagnosticSeverity.Warning
      );
    });

    test("should not detect fetch with correct Content-Type", () => {
      const code = `fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });`;
      const doc = createMockDocument(code);

      const diagnostics = checkDocumentForIssues(doc);
      assert.strictEqual(diagnostics.length, 0);
    });

    test("should not detect fetch without JSON.stringify", () => {
      const code = `fetch("/api/data", {
        method: "POST",
        body: data
      });`;
      const doc = createMockDocument(code);

      const diagnostics = checkDocumentForIssues(doc);
      assert.strictEqual(diagnostics.length, 0);
    });

    test("should detect multiple issues in same document", () => {
      const code = `
        fetch("/api/users", {
          method: "POST",
          body: JSON.stringify(user)
        });
        
        fetch("/api/posts", {
          method: "PUT",
          body: JSON.stringify(post)
        });
        
        fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(comment)
        });
      `;
      const doc = createMockDocument(code);

      const diagnostics = checkDocumentForIssues(doc);
      assert.strictEqual(diagnostics.length, 2); // First two should have issues, third is correct
    });
  });

  suite("createDiagnostic", () => {
    test("should create diagnostic with correct properties", () => {
      const fetchMatch = {
        content: `method: "POST", body: JSON.stringify(data)`,
        index: 20,
        fullMatch: `fetch("/api", {method: "POST", body: JSON.stringify(data)})`,
      };

      const doc = createMockDocument("some code before fetch call");

      const diagnostic = createDiagnostic(doc, fetchMatch, 22, 15);

      assert.strictEqual(diagnostic.message, DIAGNOSTIC_MESSAGE);
      assert.strictEqual(diagnostic.source, DIAGNOSTIC_SOURCE);
      assert.strictEqual(
        diagnostic.severity,
        vscode.DiagnosticSeverity.Warning
      );
      assert.ok(diagnostic.range instanceof vscode.Range);
    });
  });

  suite("Integration Tests", () => {
    test("should handle complex real-world fetch call", () => {
      const code = `async function createUser(userData) {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify(userData)
        });
        return response.json();
      }`;
      const doc = createMockDocument(code);

      const diagnostics = checkDocumentForIssues(doc);
      assert.strictEqual(diagnostics.length, 1);
    });

    test("should handle fetch with mixed quote styles", () => {
      const code = `fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });`;
      const doc = createMockDocument(code);

      const diagnostics = checkDocumentForIssues(doc);
      assert.strictEqual(diagnostics.length, 0); // Should not flag this as it has correct header
    });
  });
});
