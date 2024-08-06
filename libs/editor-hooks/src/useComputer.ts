import type { Computer } from '@decipad/computer-interfaces';
import { useNotebookState } from '@decipad/notebook-state';
import { getDefined } from '@decipad/utils';
import { useNotebookId } from './useNotebookId';

export const useComputer = (myNotebookId?: string): Computer => {
  const notebookId = useNotebookId();
  const effectiveId = myNotebookId ?? notebookId;
  const computer = useNotebookState(effectiveId, (s) => s.computer);
  return getDefined(computer);
};
