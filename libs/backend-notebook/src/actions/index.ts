import { actions as baseActions } from '@decipad/notebook-open-api';
import { createNotebook } from './createNotebook';
import { evalCode } from './evalCode';
import { generateCode } from './generateCode';
import { searchForNotebookTemplates } from './searchForNotebookTemplates';
import { injectNotebookTemplate } from './injectNotebookTemplate';

export const actions = {
  ...baseActions,
  createNotebook,
  evalCode,
  generateCode,
  searchForNotebookTemplates,
  injectNotebookTemplate,
};
