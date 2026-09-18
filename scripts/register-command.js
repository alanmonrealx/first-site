// Run with Node.js 22+: node --env-file=.env scripts/register-command.js
const { DISCORD_APPLICATION_ID: appId, DISCORD_BOT_TOKEN: token, DISCORD_GUILD_ID: guildId } = process.env;
if (!/^\d+$/.test(appId ?? "") || !token || (guildId && !/^\d+$/.test(guildId))) {
  console.error("Set DISCORD_APPLICATION_ID and DISCORD_BOT_TOKEN in .env. Optional: DISCORD_GUILD_ID for instant server-only registration.");
  process.exit(1);
}
const scope = guildId ? `/guilds/${guildId}` : "";
const response = await fetch(`https://discord.com/api/v10/applications/${appId}${scope}/commands`, {
  method: "POST",
  headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ name: "hello", description: "Say hello world", type: 1 }),
});
if (!response.ok) {
  console.error(`Discord registration failed (HTTP ${response.status}). Check application ID, token, and server installation.`);
  process.exit(1);
}
console.log(`/hello registered ${guildId ? "for your server" : "globally"}.`);
console.log(`Install: https://discord.com/oauth2/authorize?client_id=${appId}&scope=applications.commands&integration_type=0`);
