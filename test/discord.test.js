import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const pair = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
const publicKey = Buffer.from(await crypto.subtle.exportKey("raw", pair.publicKey)).toString("hex");
const env = { DISCORD_PUBLIC_KEY: publicKey };
async function signed(body, timestamp = String(Math.floor(Date.now() / 1000))) {
  const signature = Buffer.from(await crypto.subtle.sign("Ed25519", pair.privateKey, new TextEncoder().encode(timestamp + body))).toString("hex");
  return new Request("https://example.com/interactions", { method: "POST", body, headers: { "X-Signature-Ed25519": signature, "X-Signature-Timestamp": timestamp } });
}
test("signed Discord verification ping", async () => {
  assert.deepEqual(await (await worker.fetch(await signed('{"type":1}'), env)).json(), { type: 1 });
});
test("signed /hello replies with hello world", async () => {
  const response = await worker.fetch(await signed(JSON.stringify({ type: 2, data: { type: 1, name: "hello" } })), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { type: 4, data: { content: "hello world", allowed_mentions: { parse: [] } } });
});
test("unsigned and tampered requests fail", async () => {
  assert.equal((await worker.fetch(new Request("https://example.com/interactions", { method: "POST", body: '{"type":1}' }), env)).status, 401);
  const original = await signed('{"type":1}');
  const tampered = new Request(original.url, { method: "POST", headers: original.headers, body: '{"type":2}' });
  assert.equal((await worker.fetch(tampered, env)).status, 401);
});
test("stale signed requests fail", async () => {
  assert.equal((await worker.fetch(await signed('{"type":1}', "1"), env)).status, 401);
});
test("invalid signed JSON and unknown commands fail", async () => {
  assert.equal((await worker.fetch(await signed("not json"), env)).status, 400);
  assert.equal((await worker.fetch(await signed('{"type":2,"data":{"type":1,"name":"other"}}'), env)).status, 400);
});
test("bounded request body", async () => {
  assert.equal((await worker.fetch(await signed("x".repeat(65537)), env)).status, 413);
});
test("missing config and wrong methods", async () => {
  assert.equal((await worker.fetch(await signed('{"type":1}'), {})).status, 503);
  assert.equal((await worker.fetch(new Request("https://example.com/interactions"), env)).status, 405);
});
test("Kevin homepage still works", async () => {
  const response = await worker.fetch(new Request("https://example.com/"), {});
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Hello,<br><span>Kevin!/);
});
