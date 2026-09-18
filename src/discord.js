const encoder = new TextEncoder();
const MAX_BODY_BYTES = 64 * 1024;

function unhex(value) {
  return Uint8Array.from(value.match(/../g), (byte) => parseInt(byte, 16));
}

export async function discord(request, env) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
  }
  if (!/^[a-f0-9]{64}$/i.test(env.DISCORD_PUBLIC_KEY ?? "")) {
    return new Response("Discord public key is not configured", { status: 503 });
  }
  const signature = request.headers.get("X-Signature-Ed25519") ?? "";
  const timestamp = request.headers.get("X-Signature-Timestamp") ?? "";
  if (!/^[a-f0-9]{128}$/i.test(signature) || !/^\d{1,12}$/.test(timestamp) ||
      Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    return new Response("Invalid request signature", { status: 401 });
  }

  // Read the original bytes, with a limit even when Content-Length is absent.
  const reader = request.body?.getReader();
  const chunks = [];
  let length = 0;
  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > MAX_BODY_BYTES) {
          await reader.cancel();
          return new Response("Payload too large", { status: 413 });
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
  }
  const prefix = encoder.encode(timestamp);
  const signed = new Uint8Array(prefix.length + length);
  signed.set(prefix);
  let offset = prefix.length;
  for (const chunk of chunks) { signed.set(chunk, offset); offset += chunk.length; }
  let valid = false;
  try {
    const key = await crypto.subtle.importKey("raw", unhex(env.DISCORD_PUBLIC_KEY), "Ed25519", false, ["verify"]);
    valid = await crypto.subtle.verify("Ed25519", key, unhex(signature), signed);
  } catch {
    valid = false;
  }
  if (!valid) return new Response("Invalid request signature", { status: 401 });

  let interaction;
  try {
    interaction = JSON.parse(new TextDecoder().decode(signed.subarray(prefix.length)));
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  if (interaction?.type === 1) return Response.json({ type: 1 });
  if (interaction?.type === 2 && interaction.data?.type === 1 && interaction.data?.name === "hello") {
    return Response.json({ type: 4, data: { content: "hello world", allowed_mentions: { parse: [] } } });
  }
  return new Response("Unsupported interaction", { status: 400 });
}
