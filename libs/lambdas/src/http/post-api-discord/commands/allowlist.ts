import Boom from '@hapi/boom';
import tables, { allPages } from '@decipad/services/tables';
import { DynamoDbQuery } from '@decipad/backendtypes';
import { getDefined } from '@decipad/utils';
import {
  AllowlistAddApplicationCommandDataOption,
  AllowlistRemoveApplicationCommandDataOption,
  ApplicationCommandDataOption,
  ApplicationCommandDataOptions,
} from '../command';

async function add(
  options: AllowlistAddApplicationCommandDataOption['options']
): Promise<string> {
  const option = getDefined(
    options.find((o) => o.name === 'email'),
    'no option named email'
  );
  const data = await tables();
  const email = (option.value ?? '').toLowerCase();
  await data.allowlist.put({ id: email });

  return `Email address \`${email}\` successfully added to the allow list`;
}

async function remove(
  options: AllowlistRemoveApplicationCommandDataOption['options']
): Promise<string> {
  const option = getDefined(
    options.find((o) => o.name === 'email'),
    'no option named email'
  );
  const data = await tables();
  const email = (option.value ?? '').toLowerCase();
  const exists = await data.allowlist.get({ id: email });
  if (!exists) {
    throw Boom.notFound(
      `Could not find allow list entry with email address \`${email}\``
    );
  }
  await data.allowlist.delete({ id: email });
  return `Email address \`${email}\` successfully removed from the allow list`;
}

async function list(): Promise<string> {
  const data = await tables();
  const query: DynamoDbQuery = {
    ExpressionAttributeValues: {},
    KeyConditionExpression: 'attribute_exists(id)',
  };
  const entries: string[] = [];
  for await (const entry of allPages(data.allowlist, query)) {
    if (entry) {
      entries.push(entry.id);
    }
  }

  return `Allow list currently consists of:

\`\`\`
${entries.map((entry) => `${entry}\n`)}
\`\`\`

(retrieved at ${new Date()})
  `;
}

export default function allowlist(
  options: ApplicationCommandDataOptions
): Promise<string> {
  if (options.length !== 1) {
    throw Boom.notAcceptable('allowlist command should only have one option');
  }
  const option = options[0];
  switch (option.name) {
    case 'add': {
      return add(option.options);
    }
    case 'remove': {
      return remove(option.options);
    }
    case 'list': {
      return list();
    }
    default: {
      throw Boom.notAcceptable(
        `Unknown option ${(option as ApplicationCommandDataOption).name}`
      );
    }
  }
}
