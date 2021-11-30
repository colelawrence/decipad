#!/usr/bin/env node

import fetch from 'isomorphic-fetch';

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

(async () => {
  const url = `https://discord.com/api/v8/applications/${process.env.DISCORD_APP_ID}/commands`;

  const commands = [
    {
      name: 'allowlist-get',
      application_id: process.env.DISCORD_APP_ID,
      type: 1, // This is an example CHAT_INPUT or Slash Command, with a type of 1
      description: 'find an entry in the allow list',
      options: [
        {
          name: 'email',
          description: "The email address you're searching for",
          type: 1,
          required: true,
        },
      ],
    },
  ];

  // For authorization, you can use either your bot token
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
  };

  const response = await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(commands),
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
