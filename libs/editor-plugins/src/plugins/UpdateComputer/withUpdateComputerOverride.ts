import type { Computer } from '@decipad/computer-interfaces';
import type { MyElement, MyEditor } from '@decipad/editor-types';
import { editorToProgram } from '@decipad/editor-language-elements';
import debounce from 'lodash/debounce';
import {
  findNode,
  getNode,
  isElement,
  TOperation,
} from '@udecode/plate-common';
import { affectedPaths } from './affectedPaths';
import { allBlockIds } from './allBlockIds';

const DEBFAULT_DEBOUNCE_UPDATE_COMPUTER_MS = 500;

export interface WithUpdateComputerOverrideOptions {
  debounceEditorChangesMs?: number;
}

export const withUpdateComputerOverride =
  (
    computer: Computer,
    {
      debounceEditorChangesMs = DEBFAULT_DEBOUNCE_UPDATE_COMPUTER_MS,
    }: WithUpdateComputerOverrideOptions = {}
  ) =>
  (editor: MyEditor) => {
    const { onChange, apply } = editor;

    let dirtyBlocksSet = new Map<string, MyElement>();
    let removedBlockIds: string[] = [];

    const compute = async () => {
      const dirty = dirtyBlocksSet;
      dirtyBlocksSet = new Map();
      // eslint-disable-next-line no-param-reassign
      const programUpdates = await editorToProgram(
        editor,
        dirty.values(),
        computer
      );
      computer.pushComputeDelta({
        program: {
          upsert: programUpdates,
          remove: removedBlockIds,
        },
      });

      removedBlockIds = [];
    };

    let computing: Promise<void> | undefined;
    let next: (() => void) | undefined;

    const pushCompute = () => {
      if (computing) {
        next = pushCompute;
      } else {
        computing = compute().finally(() => {
          computing = undefined;
          if (next) {
            const n = next;
            next = undefined;
            n();
          }
        });
      }
    };

    const maybeCompute = debounce(pushCompute, debounceEditorChangesMs);

    for (const block of editor.children) {
      dirtyBlocksSet.set(block.id ?? '', block);
    }

    const removeNode = (id: string) => {
      for (const blockId of allBlockIds(editor, id)) {
        dirtyBlocksSet.delete(blockId);
        removedBlockIds.push(blockId);
      }
    };

    // eslint-disable-next-line no-param-reassign
    editor.apply = (op) => {
      if (op.type !== 'remove_node') {
        apply(op);
      }
      updateDirtyBlocksForAffectedPaths(op);
      handleRemoveNodeOperation(op);
      handleSetNodeOperation(op);
      if (op.type === 'remove_node') {
        apply(op);
      }
    };

    const updateDirtyBlocksForAffectedPaths = (op: TOperation) => {
      for (const path of affectedPaths(op)) {
        const node = getNode(editor, path);
        if (isElement(node)) {
          dirtyBlocksSet.set(node.id ?? '', node);
        }
      }
    };

    const handleRemoveNodeOperation = (op: TOperation) => {
      if (op.type !== 'remove_node') {
        return;
      }

      const { node } = op;
      if (isElement(node)) {
        removeNode((node as MyElement).id ?? '');
        if (op.path.length > 1) {
          const rootBlockEntry = findNode(editor, {
            at: op.path.slice(0, 1),
          });
          if (rootBlockEntry) {
            const [rootBlock] = rootBlockEntry;
            if (isElement(rootBlock)) {
              dirtyBlocksSet.set(rootBlock.id ?? '', rootBlock);
            }
          }
        }
      }
    };

    const handleSetNodeOperation = (op: TOperation) => {
      if (
        op.type !== 'set_node' ||
        !('id' in op.newProperties) ||
        !('id' in op.properties) ||
        op.newProperties.id === op.properties.id ||
        op.path.length === 0
      ) {
        return;
      }

      updateDirtyBlockForNodeId(op.properties.id as string);
      updateDirtyBlockForNodeId(op.newProperties.id as string);
    };

    const updateDirtyBlockForNodeId = (id: string) => {
      const nodeEntry = findNode(editor, { match: { id } });
      if (nodeEntry) {
        const [node] = nodeEntry;
        if (isElement(node)) {
          dirtyBlocksSet.set(node.id ?? '', node);
        }
      }
    };

    // eslint-disable-next-line no-param-reassign
    editor.onChange = () => {
      maybeCompute();
      onChange();
    };

    maybeCompute();

    return editor;
  };
