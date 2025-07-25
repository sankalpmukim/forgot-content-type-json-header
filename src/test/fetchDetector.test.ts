import * as assert from "assert";

import {
  calculateAbsolutePosition,
  findFetchCalls,
  findJsonStringifyPosition,
  hasCorrectContentType,
  hasJsonStringify,
  isSupportedLanguage,
} from "../fetchDetector";

suite("FetchDetector Tests", () => {
  suite("isSupportedLanguage", () => {
    test("should return true for supported languages", () => {
      assert.strictEqual(isSupportedLanguage("javascript"), true);
      assert.strictEqual(isSupportedLanguage("typescript"), true);
      assert.strictEqual(isSupportedLanguage("javascriptreact"), true);
      assert.strictEqual(isSupportedLanguage("typescriptreact"), true);
    });

    test("should return false for unsupported languages", () => {
      assert.strictEqual(isSupportedLanguage("python"), false);
      assert.strictEqual(isSupportedLanguage("java"), false);
      assert.strictEqual(isSupportedLanguage("html"), false);
    });
  });

  suite("findFetchCalls", () => {
    test("should find basic fetch call with options", () => {
      const code = `fetch("/api/data", {
        method: "POST",
        body: JSON.stringify(data)
      });`;

      const matches = findFetchCalls(code);
      assert.strictEqual(matches.length, 1);
      assert.ok(matches[0].content.includes("method"));
      assert.ok(matches[0].content.includes("body"));
    });

    test("should find multiple fetch calls", () => {
      const code = `
        fetch("/api/users", { method: "GET" });
        fetch("/api/posts", { method: "POST", body: JSON.stringify(post) });
      `;

      const matches = findFetchCalls(code);
      assert.strictEqual(matches.length, 2);
    });

    test("should not find fetch calls without options", () => {
      const code = `fetch("/api/data");`;

      const matches = findFetchCalls(code);
      assert.strictEqual(matches.length, 0);
    });
  });

  suite("hasJsonStringify", () => {
    test("should detect JSON.stringify in fetch options", () => {
      const fetchContent = `method: "POST", body: JSON.stringify(data)`;
      assert.strictEqual(hasJsonStringify(fetchContent), true);
    });

    test("should detect JSON.stringify with spaces", () => {
      const fetchContent = `method: "POST", body: JSON.stringify ( data )`;
      assert.strictEqual(hasJsonStringify(fetchContent), true);
    });

    test("should not detect when JSON.stringify is not present", () => {
      const fetchContent = `method: "POST", body: data`;
      assert.strictEqual(hasJsonStringify(fetchContent), false);
    });
  });

  suite("hasCorrectContentType", () => {
    test("should detect correct Content-Type with double quotes", () => {
      const fetchContent = `
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      `;
      assert.strictEqual(hasCorrectContentType(fetchContent), true);
    });

    test("should detect correct Content-Type with single quotes", () => {
      const fetchContent = `
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      `;
      assert.strictEqual(hasCorrectContentType(fetchContent), true);
    });

    test("should be case insensitive for header name", () => {
      const fetchContent = `
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data)
      `;
      assert.strictEqual(hasCorrectContentType(fetchContent), true);
    });

    test("should not detect incorrect Content-Type", () => {
      const fetchContent = `
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(data)
      `;
      assert.strictEqual(hasCorrectContentType(fetchContent), false);
    });

    test("should not detect when Content-Type is missing", () => {
      const fetchContent = `
        method: "POST",
        body: JSON.stringify(data)
      `;
      assert.strictEqual(hasCorrectContentType(fetchContent), false);
    });
  });

  suite("findJsonStringifyPosition", () => {
    test("should find position of JSON.stringify", () => {
      const fetchContent = `method: "POST", body: JSON.stringify(data)`;
      const position = findJsonStringifyPosition(fetchContent);

      assert.ok(position);
      assert.strictEqual(
        position.index,
        fetchContent.indexOf("JSON.stringify")
      );
      assert.strictEqual(position.length, "JSON.stringify(".length);
    });

    test("should return null when JSON.stringify not found", () => {
      const fetchContent = `method: "POST", body: data`;
      const position = findJsonStringifyPosition(fetchContent);

      assert.strictEqual(position, null);
    });
  });

  suite("calculateAbsolutePosition", () => {
    test("should calculate correct absolute position", () => {
      const fetchMatch = {
        content: `method: "POST", body: JSON.stringify(data)`,
        index: 10,
        fullMatch: `fetch("/api", {method: "POST", body: JSON.stringify(data)})`,
      };

      const jsonStringifyMatch = {
        index: 22, // position within fetchMatch.content
        length: 15,
      };

      const absolutePos = calculateAbsolutePosition(
        fetchMatch,
        jsonStringifyMatch
      );

      // Should be: fetchMatch.index + position where content starts in fullMatch + jsonStringifyMatch.index
      const expectedPos =
        10 + fetchMatch.fullMatch.indexOf(fetchMatch.content) + 22;
      assert.strictEqual(absolutePos, expectedPos);
    });
  });
});
