import { discord } from "./discord.js";

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#101820">
  <title>Hello, Kevin!</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100svh; display: grid; place-items: center; padding: 24px; background: #101820; color: #f7f5ef; font-family: system-ui, sans-serif; }
    main { width: min(100%, 720px); padding: clamp(28px, 7vw, 72px); border: 1px solid #34434a; border-radius: 28px; background: radial-gradient(ellipse at top right, #25433b, #18232b 70%); }
    .eyebrow { color: #bcf582; font-size: 12px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; }
    h1 { font-size: clamp(48px, 10vw, 88px); line-height: 1.05; letter-spacing: -.06em; margin: 30px 0 22px; }
    h1 span { color: #bcf582; }
    p { color: #bac7cb; line-height: 1.7; font-size: 18px; }
    footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #34434a; color: #bac7cb; font-size: 13px; }
  </style>
</head>
<body>
  <main>
    <div class="eyebrow">A little corner of the internet</div>
    <h1>Hello,<br><span>Kevin!</span></h1>
    <p>Big ideas start with a simple hello.<br>Welcome to my first Cloudflare Worker app.</p>
    <footer>Made for Kevin Monreal &middot; Powered by Cloudflare Workers</footer>
  </main>
</body>
</html>`;

export default {
  async fetch(request, env = {}) {
    if (new URL(request.url).pathname === "/interactions") return discord(request, env);
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    return new Response(request.method === "HEAD" ? null : html, {
      headers: { "Content-Type": "text/html; charset=utf-8", "X-Content-Type-Options": "nosniff" },
    });
  },
};
