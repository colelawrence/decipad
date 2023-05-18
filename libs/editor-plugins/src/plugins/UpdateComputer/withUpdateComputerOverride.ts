import { MyElement, MyEditor } from '@decipad/editor-types';
import { Computer, ProgramBlock } from '@decipad/computer';
import {
  editorToProgram,
  interactiveElementTypes,
} from '@decipad/editor-language-elements';
import { debounce } from 'lodash';
import { getNode, isElement } from '@udecode/plate';
import { affectedBlocks } from './affectedBlocks';

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

    const compute = async () => {
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
      const newRequest = { program: Array.from(programCache.values()) };
      computer.pushCompute(newRequest);
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
      programCache.delete(id);
      dirtyBlocksSet.delete(id);
    };

    // eslint-disable-next-line no-param-reassign
    editor.apply = (op) => {
      apply(op);
      for (const block of affectedBlocks(op)) {
        if (op.type === 'remove_node' && op.path.length <= 1) {
          const { node } = op;
          if (isElement(node)) {
            removeNode((node as MyElement).id);
            return;
          }
        }
        let node = getNode(editor, [block]);
        if (!node && op.type === 'remove_node') {
          node = op.node as MyElement;
        }
        if (isElement(node) && interactiveElementTypes.has(node.type)) {
          dirtyBlocksSet.set(node.id, node);
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
