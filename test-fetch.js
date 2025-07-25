// Test file to verify the extension works

// This should trigger a warning
fetch("/api/data", {
  method: "POST",
  body: JSON.stringify(data),
});

// This should NOT trigger a warning
fetch("/api/data", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
});

// Another case that should trigger a warning
fetch("/users", {
  method: "PUT",
  body: JSON.stringify({ name: "John" }),
});
