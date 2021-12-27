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
      name: 'allowlist',
      type: 1,
      application_id: process.env.DISCORD_APP_ID,
      description: 'manage the Deci allow list',
      options: [
        {
          name: 'add',
          description: 'adds an entry to the allow list',
          type: 1,
          options: [
            {
              name: 'email',
              description: 'The email address to add to the allow-list',
              required: true,
              type: 3, // string
            },
          ],
        },
        {
          name: 'remove',
          description: 'removes an entry from the allow list',
          type: 1,
          options: [
            {
              name: 'email',
              description: 'The email address to remove from the allow-list',
              required: true,
              type: 3, // string
            },
          ],
        },
        {
          name: 'list',
          description: 'lists all entries in the allow list',
          type: 1,
        },
      ],
    },
    {
      name: 'superadmins',
      type: 1,
      application_id: process.env.DISCORD_APP_ID,
      description: 'manage the Deci superadmins list',
      options: [
        {
          name: 'add',
          description: 'adds a discord user to the superadmins list',
          type: 1,
          options: [
            {
              name: 'user',
              description: 'The discord user to add to the superadmins list',
              required: true,
              type: 6, // user
            },
          ],
        },
        {
          name: 'remove',
          description: 'removes a discord user from the superadmins list',
          type: 1,
          options: [
            {
              name: 'user',
              description:
                'The discord user to remove from the superadmins list',
              required: true,
              type: 6, // user
            },
          ],
        },
        {
          name: 'is',
          description: 'lists all discord users in the superadmins list',
          type: 1,
          options: [
            {
              name: 'user',
              description: 'The discord user to inquire',
              required: true,
              type: 6, // user
            },
          ],
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
