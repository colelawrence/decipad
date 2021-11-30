#!/usr/bin/env node

import fetch from 'isomorphic-fetch';

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

(async () => {
  const url = `https://discord.com/api/v8/applications/${process.env.DISCORD_APP_ID}/commands`;

  // This is an example CHAT_INPUT or Slash Command, with a type of 1
  const json = {
    name: 'allowlist-get',
    type: 1,
    description: 'get an entry from the allow list',
    options: [
      {
        name: 'email',
        description: "The email address you're searching for",
        type: 3,
        required: true,
      },
    ],
  };

  // For authorization, you can use either your bot token
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
  };

  const response = await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(json),
    headers,
  });

  if (!response.ok) {
    throw new Error(
      'Response from discord while deploying a command was not ok:' +
        (await response.text())
    );
  }

  console.log(await response.json());
})();
