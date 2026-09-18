# Hello, Alan!

A tiny, responsive greeting page served by a Cloudflare Worker. No framework, database, secrets, or build step required.

## Deploy from GitHub

1. In Cloudflare, open **Workers & Pages** and create a Worker connected to your GitHub repository.
2. Select the `main` branch and use the repository root directory.
3. Set the Worker name to `hello-alan` (it must match `wrangler.jsonc`).
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
