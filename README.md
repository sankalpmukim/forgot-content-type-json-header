# Forgot Content Type JSON Header

A Visual Studio Code extension that helps you avoid a common mistake when using the `fetch` API: forgetting to set the `"Content-Type": "application/json"` header when sending JSON data in the request body.

## Features

- **Automatic detection**: Scans your JavaScript/TypeScript files for `fetch` calls that use `body: JSON.stringify(...)` but are missing the correct Content-Type header.
- **Real-time feedback**: Shows a yellow squiggly line under the problematic `JSON.stringify` call and a warning message.
- **Native integration**: Uses VS Code's Problems panel and diagnostics system for seamless feedback.

## Example

```js
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

## How It Works

- **Activates** for JavaScript, TypeScript, and their React variants.
- **Monitors** your code as you type or open files.
- **Detects** `fetch` calls with a JSON body but missing the correct Content-Type header.
- **Warns** you with a squiggly line and a message: `Using JSON.stringify() without "Content-Type": "application/json" header`.

## Supported Languages

- JavaScript (`.js`)
- TypeScript (`.ts`)
- JavaScript React (`.jsx`)
- TypeScript React (`.tsx`)

## Requirements

- Visual Studio Code v1.102.0 or newer

## Installation

1. Install the extension from the VS Code Marketplace or your preferred method.
2. Open or edit any supported file.
3. Warnings will appear automatically as you type or open files—no configuration needed.

## Known Issues

- Only works for direct `fetch` calls with object options.
- May not detect all dynamic or indirect usages of `fetch`.
- Does not support languages other than JavaScript/TypeScript and their React variants.

## Release Notes

### 0.0.1

- Initial release: Detects missing `Content-Type: application/json` header in `fetch` calls with JSON bodies.

---

**Enjoy safer, more reliable API calls!**
