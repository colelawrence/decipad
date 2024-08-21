import { getNotebookStore } from './notebookState';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { NotebookState, AnnotationsState } from './state';
import { useNotebookRoute } from '@decipad/routing';
import { EditorController } from '@decipad/notebook-tabs';
import { getDefined } from '@decipad/utils';
import { shallow } from 'zustand/shallow';

type StateSelectorType<U> = Parameters<
  typeof useStoreWithEqualityFn<ReturnType<typeof getNotebookStore>, U>
>[1];

export const useNotebookState = <U = NotebookState>(
  notebookId: string,
  selector: StateSelectorType<U>
) => {
  const notebookStore = getNotebookStore(notebookId);
  const partialStore = useStoreWithEqualityFn(notebookStore, selector, shallow);

  return partialStore;
};

export const useNotebookWithIdState = <U = NotebookState>(
  selector: StateSelectorType<U>
) => {
  const { notebookId } = useNotebookRoute();

  return useNotebookState(notebookId, selector);
};

// ==================================================
// Helper hooks.
//
// Uses the hooks above but provider some more type
// safery to make life easier
// ==================================================

export const useEditorController = (): EditorController => {
  return getDefined(useNotebookWithIdState((s) => s.controller));
};

export const useAnnotations = (): Omit<AnnotationsState, 'setPermission'> => {
  return useNotebookWithIdState((s) => ({
    annotations: s.annotations,
    handleExpandedBlockId: s.handleExpandedBlockId,
    expandedBlockId: s.expandedBlockId,
    permission: s.permission,
    setAnnotations: s.setAnnotations,
  }));
};
