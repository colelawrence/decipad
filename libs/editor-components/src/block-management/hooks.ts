import {
  useComputer,
  useMoveToTab,
  useNodePath,
  usePathMutatorCallback,
} from '@decipad/editor-hooks';
import type {
  MyEditor,
  MyElement,
  TopLevelValue,
  MyNode,
} from '@decipad/editor-types';
import { requirePathBelowBlock, setSelection } from '@decipad/editor-utils';
import type { TNodeEntry } from '@udecode/plate-common';
import {
  findNode,
  findNodePath,
  getStartPoint,
  hasNode,
  insertElements,
  removeNodes,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import {
  blockSelectionSelectors,
  blockSelectionStore,
} from '@udecode/plate-selection';
import { useCallback, useContext } from 'react';
import utils from './utils';
import { ControllerProvider } from '@decipad/react-contexts';

type OnDelete = (() => void) | 'none' | undefined;

type BlockActionParams = {
  editor: MyEditor;
  element: MyElement;
};

function getSelection(): [boolean, Set<string>] {
  const selected = blockSelectionSelectors.selectedIds() as Set<string>;
  return [selected.size > 1, selected];
}

export const useBlockActions = ({ editor, element }: BlockActionParams) => {
  const nodePath = useNodePath(element);
  const computer = useComputer();

  const setIsHidden = usePathMutatorCallback(
    editor,
    nodePath,
    'isHidden' as keyof MyNode,
    'DraggableBlock'
  );

  const onDelete = useCallback(
    (parentOnDelete?: OnDelete): void => {
      const path = findNodePath(editor, element);
      const onDeleteInternal = () => {
        const [isMultipleSelection, blockSelectedIds] = getSelection();

        if (isMultipleSelection) {
          for (const id of blockSelectedIds.values()) {
            const entry = findNode(editor, { match: { id } });
            if (!entry) continue;
            removeNodes(editor, { at: entry[1] });
          }

          return;
        }
        if (path) {
          removeNodes(editor, {
            at: path,
          });
          if (hasNode(editor, path)) {
            const point = getStartPoint(editor, path);
            setSelection(editor, {
              anchor: point,
              focus: point,
            });
          }
        }
      };

      if (path) {
        if (typeof parentOnDelete === 'function') {
          parentOnDelete();
        }
        onDeleteInternal();
      }
    },
    [editor, element]
  );

  const moveTab = useMoveToTab();
  const controller = useContext(ControllerProvider);

  const onMoveTab = useCallback(
    (tabId: string) =>
      withoutNormalizing(editor, () => {
        if (!nodePath) return;
        if (!controller) {
          throw new Error('cannot find editor controller');
        }

        const [isMultipleSelection, blockSelectedIds] = getSelection();

        if (!isMultipleSelection) {
          controller.whileMoving(() => {
            onDelete();
            moveTab(tabId, element as TopLevelValue);
          });
          return;
        }

        const entries: TNodeEntry<TopLevelValue>[] = [];

        for (const id of blockSelectedIds.values()) {
          const entry = findNode<TopLevelValue>(editor, { match: { id } });
          if (!entry) continue;

          entries.push(entry);
        }

        entries.sort(([, aPath], [, bPath]) => aPath[0] - bPath[0]);

        for (let i = 0; i < entries.length; i += 1) {
          // entry = [node, path]
          // so we are selecting the first number, of the path, of the first entry.

          controller.whileMoving(() => {
            removeNodes(editor, { at: [entries[0][1][0]] });
            moveTab(tabId, entries[i][0]);
          });
        }

        // Reset the selection
        blockSelectionStore.set.selectedIds(new Set());
      }),
    [editor, nodePath, controller, onDelete, moveTab, element]
  );

  const onDuplicate = useCallback(async () => {
    const [isMultipleSelection, blockSelectedIds] = getSelection();

    if (isMultipleSelection) {
      const nodes = [];
      let largestPath = 0;
      for (const id of blockSelectedIds.values()) {
        const entry = findNode<MyElement>(editor, { match: { id } });
        if (!entry) continue;
        const [node, path] = entry;
        // eslint-disable-next-line no-await-in-loop
        nodes.push(await utils.cloneProxy(computer, node));
        if (path[0] > largestPath) {
          [largestPath] = path;
        }
      }

      insertElements(editor, nodes, {
        at: requirePathBelowBlock(editor, [largestPath]),
      });
      return;
    }

    const path = findNodePath(editor, element);
    if (!path) return;

    const newEl = await utils.cloneProxy(computer, element);
    insertElements(editor, newEl, {
      at: requirePathBelowBlock(editor, path),
    });
  }, [computer, editor, element]);

  const onShowHide = useCallback(
    (a: 'show' | 'hide') => {
      const [isMultipleSelection, blockSelectedIds] = getSelection();

      if (isMultipleSelection) {
        for (const id of blockSelectedIds.values()) {
          const entry = findNode<MyElement>(editor, { match: { id } });
          if (!entry) continue;
          const [, path] = entry;
          setNodes(editor, { isHidden: a === 'hide' }, { at: path });
        }
        return;
      }

      if (a === 'show') setIsHidden(false, 'showing');

      if (a === 'hide') setIsHidden(true, 'hiding');
    },
    [editor, setIsHidden]
  );

  return { onDelete, onMoveTab, onDuplicate, onShowHide };
};
