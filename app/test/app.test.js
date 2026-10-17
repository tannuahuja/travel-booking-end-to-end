const test = require("node:test");
const assert = require("node:assert/strict");
const { app } = require("../src/app");
const http = require("node:http");

test("health endpoint responds with a JSON health state", async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);
    assert.ok([200, 503].includes(response.status));
    const body = await response.json();
    assert.ok(["ok", "degraded"].includes(body.status));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("version endpoint returns service name", async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/version`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).name, "travel-booking");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
