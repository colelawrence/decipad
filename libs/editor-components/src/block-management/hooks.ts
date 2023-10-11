import {
  useMoveToTab,
  useNodePath,
  usePathMutatorCallback,
} from '@decipad/editor-hooks';
import { MyEditor, MyElement, TopLevelValue } from '@decipad/editor-types';
import { requirePathBelowBlock, setSelection } from '@decipad/editor-utils';
import {
  TNodeEntry,
  findNode,
  findNodePath,
  getStartPoint,
  hasNode,
  insertElements,
  removeNodes,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate';
import {
  blockSelectionSelectors,
  blockSelectionStore,
} from '@udecode/plate-selection';
import { useCallback } from 'react';
import utils from './utils';
import { useComputer } from '@decipad/react-contexts';

type OnDelete = (() => void) | 'none' | undefined;

type BlockActionParams = {
  editor: MyEditor;
  element: MyElement;
};

export const useBlockActions = ({ editor, element }: BlockActionParams) => {
  const blockSelectedIds = blockSelectionSelectors.selectedIds() as Set<string>;
  const isMultipleSelection = blockSelectedIds?.size > 1;
  const nodePath = useNodePath(element);
  const computer = useComputer();

  const setIsHidden = usePathMutatorCallback(
    editor,
    nodePath,
    'isHidden',
    'DraggableBlock'
  );

  const onDelete = useCallback(
    (parentOnDelete?: OnDelete): void => {
      const path = findNodePath(editor, element);
      const onDeleteInternal = () => {
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
        typeof parentOnDelete === 'function'
          ? parentOnDelete()
          : onDeleteInternal();
      }
    },
    [blockSelectedIds, editor, element, isMultipleSelection]
  );

  const moveTab = useMoveToTab();

  const onMoveTab = useCallback(
    (tabId: string) =>
      withoutNormalizing(editor, () => {
        if (!nodePath) return;

        if (!isMultipleSelection) {
          onDelete();
          moveTab(tabId, element as TopLevelValue);
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
          removeNodes(editor, { at: [entries[0][1][0]] });
          moveTab(tabId, entries[i][0]);
        }

        // Reset the selection
        blockSelectionStore.set.selectedIds(new Set());
      }),
    [
      editor,
      nodePath,
      isMultipleSelection,
      onDelete,
      moveTab,
      element,
      blockSelectedIds,
    ]
  );

  const onDuplicate = useCallback(() => {
    if (isMultipleSelection) {
      const nodes = [];
      let largestPath = 0;
      for (const id of blockSelectedIds.values()) {
        const entry = findNode<MyElement>(editor, { match: { id } });
        if (!entry) continue;
        const [node, path] = entry;
        nodes.push(utils.cloneProxy(computer, node));
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
    if (path) {
      const newEl = utils.cloneProxy(computer, element);
      insertElements(editor, newEl, {
        at: requirePathBelowBlock(editor, path),
      });
    }
  }, [computer, editor, element, blockSelectedIds, isMultipleSelection]);

  const onShowHide = useCallback(
    (a: 'show' | 'hide') => {
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
    [editor, blockSelectedIds, isMultipleSelection, setIsHidden]
  );

  return { onDelete, onMoveTab, onDuplicate, onShowHide };
};
