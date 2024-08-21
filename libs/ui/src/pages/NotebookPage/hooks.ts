import { getNotebookStore } from '@decipad/notebook-state';
import { useEffect } from 'react';
import { useNotebookRoute } from '@decipad/routing';
import { cssVarName } from '../../primitives';

/**
 * A hook that sets the CSS variable for the data drawer height.
 *
 * This is used for tablet view when the sidebar has position absolute,
 * over the editor. But we don't want it to go all the way down into the
 * data drawer.
 *
 * This however, is tech debt. And notebook page should shuffle the way
 * it's rendered instead of having these solutions.
 */
export const useSetDataDrawerVar = () => {
  const { notebookId } = useNotebookRoute();

  useEffect(() => {
    const store = getNotebookStore(notebookId);

    const updateVar = (height: number) => {
      const root = document.documentElement;
      root.style.setProperty(cssVarName('dataDrawerHeight'), `${height}px`);
    };

    const unsubscribe = store.subscribe((s) => s.height, updateVar);

    updateVar(store.getState().height);

    return () => {
      unsubscribe();
    };
  }, [notebookId]);
};
