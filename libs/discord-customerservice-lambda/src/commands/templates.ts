import Boom, { notFound } from '@hapi/boom';
import tables from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import {
  TemplatesApplicationCommandDataOption,
  TemplatesAddApplicationCommandDataOption,
  TemplatesRemoveApplicationCommandDataOption,
} from '../command';
import { allPages } from '../../../tables/src/utils/all-pages';
import { createNotebookUrl } from '../utils/createNotebookUrl';
import { parseNotebookUrl } from '@decipad/backend-utils';

async function add(
  options: TemplatesAddApplicationCommandDataOption['options']
): Promise<string> {
  const option = getDefined(
    options.find((o) => o.name === 'url'),
    'no option named url'
  );
  const { notebookId } = parseNotebookUrl(option.value);
  const data = await tables();

  const notebook = await data.pads.get({ id: notebookId });
  if (!notebook) {
    throw notFound();
  }

  if (notebook.isTemplate) {
    return 'Notebook is already template';
  }
  notebook.isTemplate = 1;
  await data.pads.put(notebook, 1); // always trigger maintenance

  return `Added template`;
}

async function remove(
  options: TemplatesRemoveApplicationCommandDataOption['options']
): Promise<string> {
  const option = getDefined(
    options.find((o) => o.name === 'url'),
    'no option named url'
  );
  const { notebookId } = parseNotebookUrl(option.value);
  const data = await tables();

  const notebook = await data.pads.get({ id: notebookId });
  if (!notebook) {
    throw notFound();
  }

  if (!notebook.isTemplate) {
    return 'Notebook is already not a template';
  }
  notebook.isTemplate = 0;
  await data.pads.put(notebook, 1); // always trigger maintenance

  return `Added template`;
}

async function list(): Promise<string> {
  const data = await tables();
  const entries: string[] = [];
  for await (const entry of allPages(data.pads, {
    IndexName: 'byIsTemplate',
    KeyConditionExpression: 'isTemplate = :isTemplate',
    ExpressionAttributeValues: {
      ':isTemplate': 1,
    },
  })) {
    if (entry) {
      entries.push(createNotebookUrl(entry));
    }
  }

  return `Templates list currently consists of:

\`\`\`
${entries.map((entry) => `${entry}\n`)}
\`\`\`

(retrieved at ${new Date()})
  `;
}

export default function templates(
  options: TemplatesApplicationCommandDataOption[]
): Promise<string> {
  if (options.length !== 1) {
    throw Boom.notAcceptable('superadmins command should only have one option');
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
        `Unknown option ${
          (option as TemplatesApplicationCommandDataOption).name
        }`
      );
    }
  }
}
