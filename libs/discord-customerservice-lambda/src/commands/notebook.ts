import Boom from '@hapi/boom';
import { getDefined } from '@decipad/utils';
import { parseNotebookUrl } from '@decipad/backend-utils';
import {
  NotebookWriteApplicationCommandDataOption,
  NotebookReadApplicationCommandDataOption,
  NotebookApplicationCommandDataOption,
} from '../command';

async function write(
  options: NotebookWriteApplicationCommandDataOption['options']
): Promise<string> {
  const option = getDefined(
    options.find((o) => o.name === 'url'),
    'no option named url'
  );
  const user = options.find((o) => o.name === 'user');

  const url = (option.value ?? '').toLowerCase();
  const { prEnvId, notebookId } = parseNotebookUrl(url);

  if (!user) {
    throw Boom.notAcceptable('Not implemented yet');
  }

  const userId = user;

  return `${prEnvId} ${userId} ${notebookId}`;
}

async function read(
  options: NotebookReadApplicationCommandDataOption['options']
): Promise<string> {
  const option = getDefined(
    options.find((o) => o.name === 'url'),
    'no option named url'
  );
  const url = (option.value ?? '').toLowerCase();
  const { prEnvId, notebookId } = parseNotebookUrl(url);

  return `${prEnvId} ${notebookId}`;
}

export default function notebook(
  options: NotebookApplicationCommandDataOption[]
): Promise<string> {
  if (options.length !== 1) {
    throw Boom.notAcceptable('notebook command should only have one option');
  }
  const option = options[0];
  switch (option.name) {
    case 'write': {
      return write(option.options);
    }
    case 'read': {
      return read(option.options);
    }
    default: {
      throw Boom.notAcceptable(
        `Unknown option ${
          (option as NotebookApplicationCommandDataOption).name
        }`
      );
    }
  }
}
