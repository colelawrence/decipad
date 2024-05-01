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
    {
      name: 'templates',
      type: 1,
      application_id: process.env.DISCORD_APP_ID,
      description: 'manage the Decipad notebook templates',
      options: [
        {
          name: 'add',
          description: 'adds a template',
          type: 1,
          options: [
            {
              name: 'url',
              description: 'The notebook URL you want to turn into a template',
              required: true,
              type: 3, // string
            },
          ],
        },
        {
          name: 'remove',
          description: 'removes a template',
          type: 1,
          options: [
            {
              name: 'url',
              description:
                'The notebook URL you want to remove from the template list',
              required: true,
              type: 3, // string
            },
          ],
        },
        {
          name: 'list',
          description: 'lists all templates',
          type: 1,
          options: [],
        },
      ],
    },
    {
      name: 'feature',
      type: 1,
      application_id: process.env.DISCORD_APP_ID,
      description: 'manage featured notebooks on decipad',
      options: [
        {
          name: 'add',
          description: 'adds a notebook to the list of featured notebooks',
          type: 1,
          options: [
            {
              name: 'url',
              description:
                'The notebook URL you want to add to the featured list',
              required: true,
              type: 3,
            },
          ],
        },
        {
          name: 'remove',
          description: 'removes a notebook to the list of featured notebooks',
          type: 1,
          options: [
            {
              name: 'url',
              description:
                'The notebook URL you want to remove to the featured list',
              required: true,
              type: 3,
            },
          ],
        },
      ],
    },
    {
      name: 'ban',
      type: 1,
      application_id: process.env.DISCORD_APP_ID,
      description: 'ban and unban users from using Decipad',
      options: [
        {
          name: 'ban',
          description: 'bans a user',
          type: 1,
          options: [
            {
              name: 'email',
              description: 'The email of the user to ban',
              required: true,
              type: 3, // string
            },
            {
              name: 'reason',
              description: 'The reason for the ban',
              required: true,
              type: 3, // string
            },
          ],
        },
        {
          name: 'unban',
          description: 'unbans a user',
          type: 1,
          options: [
            {
              name: 'email',
              description:
                'The email address of the user to unban from Decipad',
              required: true,
              type: 3, // string
            },
          ],
        },
        {
          name: 'isbanned',
          description:
            'know if a given user is banned or not from using Decipad',
          type: 1,
          options: [
            {
              name: 'email',
              description: 'The email address of the user',
              required: true,
              type: 3, // string
            },
          ],
        },
      ],
    },
    {
      name: 'notebooks',
      type: 1,
      application_id: process.env.DISCORD_APP_ID,
      description: 'manage notebooks',
      options: [
        {
          name: 'ban',
          description: 'bans a notebook',
          type: 1,
          options: [
            {
              name: 'url',
              description: 'The url of the notebook to ban',
              required: true,
              type: 3, // string
            },
            {
              name: 'reason',
              description: 'The reason for the ban',
              required: true,
              type: 3, // string
            },
          ],
        },
        {
          name: 'unban',
          description: 'unbans a notebook',
          type: 1,
          options: [
            {
              name: 'url',
              description: 'The url of the notebook to ban',
              required: true,
              type: 3, // string
            },
          ],
        },
        {
          name: 'isbanned',
          description: 'know if a given notebook is banned',
          type: 1,
          options: [
            {
              name: 'url',
              description: 'The url of the notebook',
              required: true,
              type: 3, // string
            },
          ],
        },
        {
          name: 'copy',
          description: 'copies a notebook',
          type: 1,
          options: [
            {
              name: 'url',
              description: 'The url of the notebook to copy',
              required: true,
              type: 3, // string
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
