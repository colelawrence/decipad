import { useSyncExternalStore } from 'react';
import { useNotebookWithIdState } from '@decipad/notebook-state';

import { isElement } from '@udecode/plate-common';
import { ElementKind } from '@decipad/editor-types';

export const useFindBlock = (blockType: ElementKind) => {
  const controller = useNotebookWithIdState((s) => s.controller!);

  const hasBlock = useSyncExternalStore(
    (onStoreChange) => {
      const sub = controller.events.subscribe({
        next: (e) => {
          if (e.type !== 'any-change') return;
          if (e.op?.type !== 'insert_node' && e.op?.type !== 'remove_node')
            return;
          onStoreChange();
        },
      });

      return () => sub.unsubscribe();
    },
    () => {
      return controller.findNode(
        (node) => isElement(node) && node.type === blockType
      );
    }
  );

  return hasBlock;
};

export const useHasBlock = (blockType: ElementKind) => {
  return !!useFindBlock(blockType);
};
