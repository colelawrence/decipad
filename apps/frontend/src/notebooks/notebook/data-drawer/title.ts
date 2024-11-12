// title={mode.type === 'create' ? 'Add data' : mode.type === 'Edit data'}

import { NotebookState } from '@decipad/notebook-state';

export const titles: Record<
  NotebookState['dataDrawerMode']['type'],
  string | undefined
> = {
  edit: 'Edit data',
  create: 'Add data',
  'workspace-number': 'Workspace Number',
  'integration-preview': undefined,
  closed: undefined,
};
