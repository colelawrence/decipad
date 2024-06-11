import type { Computer } from '@decipad/computer-interfaces';
import { useNotebookState } from '@decipad/notebook-state';
import { notebooks, useRouteParams } from '@decipad/routing';
import { getDefined } from '@decipad/utils';

const isTesting = process.env.JEST_WORKER_ID !== undefined;

const useTestNotebookId = () => 'testing';

const useNotebookId = isTesting
  ? useTestNotebookId
  : () => useRouteParams(notebooks({}).notebook)?.notebook?.id ?? 'playground';

export const useComputer = (): Computer => {
  const notebookId = useNotebookId();
  const notebook = useNotebookState(notebookId);
  return getDefined(notebook.computer);
};
