import Boom from '@hapi/boom';
import tables from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import type {
  TemplatesApplicationCommandDataOption,
  NotebooksApplicationCommandDataOption,
  NotebooksBanAddApplicationCommandDataOption,
  NotebooksUnbanAddApplicationCommandDataOption,
  NotebooksIsBannedRemoveApplicationCommandDataOption,
} from '../command';
import type { CommandContext } from '../types';
import { parseNotebookUrl } from '@decipad/backend-utils';

async function banban(
  options: NotebooksBanAddApplicationCommandDataOption['options'],
  context: CommandContext
): Promise<string> {
  const option = getDefined(
    options.find((o) => o.name === 'url'),
    'no option named url'
  );
  const { notebookId } = parseNotebookUrl(option.value);

  const data = await tables();
  const notebook = await data.pads.get({ id: notebookId });
  if (!notebook) {
    return 'Could not find notebook with that URL';
  }

  if (notebook.banned) {
    return 'Notebook is already banned';
  }

  const reasonOption = getDefined(
    options.find((o) => o.name === 'reason'),
    'no option named reason'
  );

  const actorUserEmail =
    (await data.users.get({ id: context.actorUserId }))?.email ?? '<unknown>';

  notebook.banned = 1;
  notebook.bannedBy = actorUserEmail;
  notebook.bannedReason = reasonOption.value;

  await data.pads.put(notebook);

  return `Notebook banned`;
}

async function unban(
  options: NotebooksUnbanAddApplicationCommandDataOption['options']
): Promise<string> {
  const option = getDefined(
    options.find((o) => o.name === 'url'),
    'no option named url'
  );
  const { notebookId } = parseNotebookUrl(option.value);

  const data = await tables();
  const notebook = await data.pads.get({ id: notebookId });
  if (!notebook) {
    return 'Could not find notebook with that URL';
  }

  if (!notebook.banned) {
    return 'Notebook is not banned';
  }

  notebook.banned = 0;
  notebook.bannedBy = '';
  notebook.bannedReason = '';
  notebook.bannedWhen = 0;

  await data.pads.put(notebook);

  return `Notebooks unbanned`;
}

async function isbanned(
  options: NotebooksIsBannedRemoveApplicationCommandDataOption['options']
): Promise<string> {
  const option = getDefined(
    options.find((o) => o.name === 'url'),
    'no option named url'
  );
  const { notebookId } = parseNotebookUrl(option.value);

  const data = await tables();
  const notebook = await data.pads.get({ id: notebookId });
  if (!notebook) {
    return 'Could not find notebook with that URL';
  }

  if (!notebook.banned) {
    return 'Notebook is not banned';
  }

  const when = notebook.bannedWhen
    ? new Date(notebook.bannedWhen).toUTCString()
    : '<unknown>';

  return `Notebook is banned since ${when}. Reason: "${notebook.bannedReason}". Banned by: ${notebook.bannedBy}`;
}

export default function notebooks(
  options: NotebooksApplicationCommandDataOption[],
  context: CommandContext
): Promise<string> {
  if (options.length !== 1) {
    throw Boom.notAcceptable('ban command should only have one option');
  }
  const option = options[0];
  switch (option.name) {
    case 'ban': {
      return banban(option.options, context);
    }
    case 'unban': {
      return unban(option.options);
    }
    case 'isbanned': {
      return isbanned(option.options);
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
