import Boom from '@hapi/boom';
import { getDefined } from '@decipad/utils';
import {
  NotebookWriteApplicationCommandDataOption,
  NotebookReadApplicationCommandDataOption,
  NotebookApplicationCommandDataOption,
} from '../command';

function parseUrl(url: string) {
  const matchExp =
    /^https:\/\/(([a-zA-Z0-9]+)\.)?decipad.com\/workspaces\/([a-zA-Z0-9]+)\/pads\/([a-zA-Z0-9]+)(\?secret=[a-zA-Z0-9]+)*$/;
  const match = matchExp.exec(url);
  if (!(match && match[2] && match[3] && match[4])) {
    throw Boom.notAcceptable(`notebook url seems invalid: ${url}`);
  }
  const prEnvId = match[2] || 'alpha';
  const workspaceId = match[3];
  const notebookId = match[3];
  return {
    prEnvId,
    workspaceId,
    notebookId,
  };
}

async function write(
  options: NotebookWriteApplicationCommandDataOption['options']
): Promise<string> {
  const option = getDefined(
    options.find((o) => o.name === 'url'),
    'no option named url'
  );
  const user = options.find((o) => o.name === 'user');
  const workspace = options.find((o) => o.name === 'workspace');

  const url = (option.value ?? '').toLowerCase();
  const { prEnvId, workspaceId, notebookId } = parseUrl(url);

  if (!user) {
    throw Boom.notAcceptable('Not implemented yet');
  }

  const userId = user;

  return `${prEnvId} ${workspace || workspaceId} ${userId} ${notebookId}`;
}

async function read(
  options: NotebookReadApplicationCommandDataOption['options']
): Promise<string> {
  const option = getDefined(
    options.find((o) => o.name === 'url'),
    'no option named url'
  );
  const url = (option.value ?? '').toLowerCase();
  const { prEnvId, workspaceId, notebookId } = parseUrl(url);

  return `${prEnvId} ${workspaceId} ${notebookId}`;
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
