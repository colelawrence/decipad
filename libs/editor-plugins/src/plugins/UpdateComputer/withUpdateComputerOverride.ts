import { MyElement, MyEditor } from '@decipad/editor-types';
import { Computer, ProgramBlock } from '@decipad/computer';
import { editorToProgram } from '@decipad/editor-language-elements';
import debounce from 'lodash.debounce';
import { findNode, getNode, isElement } from '@udecode/plate';
import { editorStatsStore } from '@decipad/react-contexts';
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

    const programCache = new Map<string, ProgramBlock>();
    let dirtyBlocksSet = new Map<string, MyElement>();

    const removeDirtyBlocks = () => {
      for (const el of dirtyBlocksSet.values()) {
        programCache.delete(el.id);
      }
      for (const [id, block] of programCache.entries()) {
        if (
          block.isArtificial &&
          block.artificiallyDerivedFrom != null &&
          dirtyBlocksSet.has(block.artificiallyDerivedFrom)
        ) {
          programCache.delete(id);
        }
      }
    };

    const compute = async () => {
      removeDirtyBlocks();
      const dirty = dirtyBlocksSet;
      dirtyBlocksSet = new Map();
      // eslint-disable-next-line no-param-reassign
      const programUpdates = await editorToProgram(
        editor,
        dirty.values(),
        computer
      );
      for (const update of programUpdates) {
        programCache.set(update.id, update);
      }
      computer.pushCompute({ program: Array.from(programCache.values()) });
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
      dirtyBlocksSet.set(block.id, block);
    }

    const removeNode = (id: string) => {
      for (const blockId of allBlockIds(editor, id)) {
        programCache.delete(blockId);
        dirtyBlocksSet.delete(blockId);
        for (const [nodeId, block] of programCache.entries()) {
          if (
            block.type === 'identified-block' &&
            block.isArtificial &&
            block.artificiallyDerivedFrom === blockId
          ) {
            removeNode(nodeId);
          }
        }
      }
    };

    // eslint-disable-next-line no-param-reassign
    editor.apply = (op) => {
      if (op.type !== 'remove_node') {
        apply(op);
      }
      for (const path of affectedPaths(op)) {
        const node = getNode(editor, path);
        if (isElement(node)) {
          dirtyBlocksSet.set(node.id, node);
        }
      }
      if (op.type === 'remove_node') {
        const { node } = op;
        if (isElement(node)) {
          removeNode((node as MyElement).id);
          if (op.path.length > 1) {
            const rootBlockEntry = findNode(editor, {
              at: op.path.slice(0, 1),
            });
            if (rootBlockEntry) {
              const [rootBlock] = rootBlockEntry;
              if (isElement(rootBlock)) {
                dirtyBlocksSet.set(rootBlock.id, rootBlock);
              }
            }
          }
        }
      }
      if (op.type === 'remove_node') {
        apply(op);
      }
    };

    // eslint-disable-next-line no-param-reassign
    editor.onChange = () => {
      maybeCompute();
      onChange();
    };

    // push statistics from computer into the notebook state
    computer.stats.computerRequestStat$.subscribe((newStats) => {
      editorStatsStore.getState().pushComputerRequestStat(newStats);
    });
    computer.stats.computerExpressionResultStat$.subscribe((newStats) => {
      editorStatsStore.getState().pushComputerExpressionResultStat(newStats);
    });

    maybeCompute();

    return editor;
  };
