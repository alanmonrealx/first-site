# Hello, Kevin! + Discord /hello

A greeting page and a Discord slash-command endpoint served by one Cloudflare Worker. `/hello` replies `hello world`. No database or persistent bot process is required.

## Connect Discord (one-time setup)

1. Create an application at https://discord.com/developers/applications. Under General Information, copy the Application ID and Public Key.
2. In your Cloudflare Worker's Settings > Variables and Secrets, add `DISCORD_PUBLIC_KEY` with that Public Key. Use type Secret so it persists independently of Wrangler's version-controlled variables. Save/deploy the setting.
3. Deploy this repository, then set Discord's Interactions Endpoint URL to `https://YOUR-WORKER.workers.dev/interactions`. Save it. The signed verification ping must succeed. The root URL still serves the Kevin page.
4. Under Discord Installation, enable Guild Install and the `applications.commands` scope. Open the install link and add the app to your server. No privileged intents or administrator permission are needed for this command.
5. Register the command using the instructions below. For a quick server-only test, supply your server ID as `DISCORD_GUILD_ID` (Discord Developer Mode enables Copy Server ID).
6. In that server, run `/hello`. It replies `hello world`.

### Register /hello

Use Node.js 22 or newer. Create a local `.env` file in the project root (already ignored by Git):

```dotenv
DISCORD_APPLICATION_ID=your_application_id
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_GUILD_ID=your_test_server_id
```

Get the token from your application's Bot page. Keep it in this local file; never commit it or paste it into chat. The Worker needs only the Public Key, not the bot token.

```sh
npm run register:discord
```

The script creates or updates only `/hello`, preserving other commands. With a guild ID it registers immediately for that server; omit the guild ID to register globally instead. Pick one scope to avoid duplicate test/global commands. Registration is separate from deployment: changing the reply only needs a GitHub push; changing a command name or its options needs registration again.

### Verification

Run `npm test` for signed PING and /hello requests, rejection of unsigned/tampered/stale requests, invalid payloads, body limits, configuration errors, and the homepage. These run locally with generated test keys; a live Discord test is still needed after setup.

If Discord cannot save the endpoint, check the deployed URL ends with `/interactions`, the deployment succeeded, and `DISCORD_PUBLIC_KEY` is the key from the same Discord application.

Discord references: https://docs.discord.com/developers/interactions/receiving-and-responding and https://docs.discord.com/developers/interactions/application-commands

## Deploy from GitHub

1. In Cloudflare, open **Workers & Pages** and create a Worker connected to your GitHub repository.
2. Select the `main` branch and use the repository root directory.
3. Set the Worker name to `first-site` (it must match `wrangler.jsonc`).
4. Leave the build command empty and use `npx wrangler deploy` as the deploy command.
5. Deploy and open the resulting `workers.dev` URL.

Cloudflare will ask you to authorize its GitHub integration if you have not already done so. Subsequent pushes to the connected branch trigger deployment.

Official guide: https://developers.cloudflare.com/workers/ci-cd/builds/

## Run locally or deploy from a terminal

Install Node.js LTS, then run:

```sh
npm install
npm run dev
```

To check packaging or deploy:

```sh
npm run check
npx wrangler login
npm run deploy
```

Edit the greeting and styling in `src/index.js`. To rename the Worker, change `name` in `wrangler.jsonc` and use the same name in Cloudflare.
