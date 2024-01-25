import Boom from '@hapi/boom';
import { parseNotebookUrl } from '@decipad/backend-utils';
import {
  featureNotebook,
  removeFeaturedNotebook,
} from '@decipad/services/notebooks';
import {
  NotebookApplicationCommandDataOption,
  FeatureApplicationCommandDataOption,
  FeatureAddCommandDataOption,
} from '../command';

async function add(
  options: FeatureAddCommandDataOption['options']
): Promise<string> {
  const { value } = options[0];
  const { notebookId } = parseNotebookUrl(value);

  // throws if error
  await featureNotebook(notebookId);

  return 'Notebook successfully added to feature list!';
}

async function remove(
  options: FeatureAddCommandDataOption['options']
): Promise<string> {
  const { value } = options[0];
  const { notebookId } = parseNotebookUrl(value);

  // throws if error
  await removeFeaturedNotebook(notebookId);

  return 'Notebook successfully removed from feature list!';
}

export default function feature(
  options: FeatureApplicationCommandDataOption[]
): Promise<string> {
  if (options.length !== 1) {
    throw Boom.notAcceptable('notebook command should only have one option');
  }
  const option = options[0];
  switch (option.name) {
    case 'add': {
      return add(option.options);
    }
    case 'remove': {
      return remove(option.options);
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
