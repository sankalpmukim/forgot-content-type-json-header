import * as assert from "assert";

suite("Extension Listener Tests", () => {
  test("Extension has proper event listeners", () => {
    // This test verifies that the extension structure includes the necessary
    // event listeners for handling document changes and file deletions

    // Read the extension source code to verify listeners are present
    const fs = require("fs");
    const path = require("path");
    const extensionPath = path.join(
      __dirname,
      "..",
      "..",
      "src",
      "extension.ts"
    );
    const extensionCode = fs.readFileSync(extensionPath, "utf8");

    // Verify document change listener is present
    assert.ok(
      extensionCode.includes("onDidChangeTextDocument"),
      "Extension should have onDidChangeTextDocument listener"
    );

    // Verify active editor change listener is present
    assert.ok(
      extensionCode.includes("onDidChangeActiveTextEditor"),
      "Extension should have onDidChangeActiveTextEditor listener"
    );

    // Verify file deletion listener is present
    assert.ok(
      extensionCode.includes("onDidDeleteFiles"),
      "Extension should have onDidDeleteFiles listener"
    );

    // Verify diagnostic cleanup in file deletion handler
    assert.ok(
      extensionCode.includes("diagnosticCollection.delete"),
      "Extension should clean up diagnostics when files are deleted"
    );
  });

  test("File deletion handler structure", () => {
    const fs = require("fs");
    const path = require("path");
    const extensionPath = path.join(
      __dirname,
      "..",
      "..",
      "src",
      "extension.ts"
    );
    const extensionCode = fs.readFileSync(extensionPath, "utf8");

    // Verify the file deletion handler has the correct structure
    const hasDeleteFilesListener =
      /onDidDeleteFiles\s*\(\s*\([^)]*\)\s*=>\s*{/.test(extensionCode);
    assert.ok(
      hasDeleteFilesListener,
      "Should have properly structured onDidDeleteFiles listener"
    );

    // Verify it iterates over deleted files
    const hasForEachLogic = /event\.files\.forEach/.test(extensionCode);
    assert.ok(hasForEachLogic, "Should iterate over deleted files");

    // Verify it calls diagnosticCollection.delete for each file
    const hasDeleteCall = /diagnosticCollection\.delete\s*\(\s*uri\s*\)/.test(
      extensionCode
    );
    assert.ok(
      hasDeleteCall,
      "Should call diagnosticCollection.delete for each deleted file"
    );
  });

  test("Document change handlers", () => {
    const fs = require("fs");
    const path = require("path");
    const extensionPath = path.join(
      __dirname,
      "..",
      "..",
      "src",
      "extension.ts"
    );
    const extensionCode = fs.readFileSync(extensionPath, "utf8");

    // Verify document change handler calls checkDocument
    const hasDocumentChangeHandler =
      /onDidChangeTextDocument\s*\(\s*\([^)]*\)\s*=>\s*{[^}]*checkDocument/.test(
        extensionCode
      );
    assert.ok(
      hasDocumentChangeHandler,
      "Document change handler should call checkDocument"
    );

    // Verify active editor change handler calls checkDocument
    const hasEditorChangeHandler =
      /onDidChangeActiveTextEditor\s*\(\s*\([^)]*\)\s*=>\s*{[^}]*checkDocument/.test(
        extensionCode
      );
    assert.ok(
      hasEditorChangeHandler,
      "Active editor change handler should call checkDocument"
    );

    // Verify checkDocument function exists
    const hasCheckDocumentFunction =
      /function\s+checkDocument\s*\([^)]*\)\s*{/.test(extensionCode);
    assert.ok(hasCheckDocumentFunction, "Should have checkDocument function");
  });

  test("Diagnostic collection management", () => {
    const fs = require("fs");
    const path = require("path");
    const extensionPath = path.join(
      __dirname,
      "..",
      "..",
      "src",
      "extension.ts"
    );
    const extensionCode = fs.readFileSync(extensionPath, "utf8");

    // Verify diagnostic collection is created
    const hasCreateDiagnosticCollection =
      /createDiagnosticCollection\s*\(\s*\)/.test(extensionCode);
    assert.ok(
      hasCreateDiagnosticCollection,
      "Should create diagnostic collection"
    );

    // Verify diagnostic collection is added to subscriptions
    const hasSubscriptionPush =
      /subscriptions\.push\s*\(\s*diagnosticCollection\s*\)/.test(
        extensionCode
      );
    assert.ok(
      hasSubscriptionPush,
      "Should add diagnostic collection to subscriptions"
    );

    // Verify deactivate function disposes diagnostic collection
    const hasDeactivateDispose =
      /deactivate[^{]*{[^}]*diagnosticCollection\.dispose/.test(extensionCode);
    assert.ok(
      hasDeactivateDispose,
      "Deactivate function should dispose diagnostic collection"
    );
  });
});
