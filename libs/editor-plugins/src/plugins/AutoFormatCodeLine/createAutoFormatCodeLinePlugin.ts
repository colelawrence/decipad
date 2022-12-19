import { BaseEditor, Transforms, BaseRange, Point } from 'slate';
import {
  BlockElement,
  CodeLineElement,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  ParagraphElement,
  RichText,
  MyEditor,
  MARK_MAGICNUMBER,
} from '@decipad/editor-types';
import {
  pluginStore,
  getAboveNodeSafe,
  isElementOfType,
} from '@decipad/editor-utils';
import {
  getBlockAbove,
  getNodeString,
  isCollapsed,
  isElement,
  setNodes,
  getEndPoint,
  insertNodes,
  toDOMNode,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { getExprRef } from '@decipad/computer';
import { ShadowCalcReference } from '@decipad/react-contexts';
import { openEditor$ } from '@decipad/editor-components';
import { getTextBeforeCursor } from './utils';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';

type LastFormattedBlock = null | {
  readonly id: string;
  readonly oldText: string;
};

interface AutoFormatCodeLinePluginStore {
  lastFormattedBlock?: LastFormattedBlock;
}

const pluginName = 'AUTO_FORMAT_CODE_LINE_PLUGIN';

export const createAutoFormatCodeLinePlugin = createOnKeyDownPluginFactory({
  name: pluginName,
  plugin: (editor) => {
    return (event) => {
      const store = pluginStore<AutoFormatCodeLinePluginStore>(
        editor,
        pluginName,
        () => ({})
      );
      const { lastFormattedBlock } = store;
      const hasModifiers = event.ctrlKey || event.altKey || event.metaKey;

      if (!hasModifiers && event.key === '=') {
        const entry = getBlockAbove<BlockElement>(editor);
        if (!entry) return;

        const { selection } = editor;
        if (!selection || !isCollapsed(selection)) {
          return;
        }

        const [node] = entry;
        if (node.type !== ELEMENT_PARAGRAPH) {
          return;
        }

        // Because children.length is 1, we know know there is only a text child
        const paragraph = node as ParagraphElement & { children: [RichText] };

        const nodeText = `${getNodeString(paragraph)}=`;
        const textBefore = `${getTextBeforeCursor(editor, selection.focus)}=`;

        if (nodeText.trim() === '=') {
          event.preventDefault();

          setNodes(editor, { type: ELEMENT_CODE_LINE });

          store.lastFormattedBlock = {
            id: node.id,
            oldText: nodeText,
          };
        } else if (textBefore.endsWith(' =')) {
          event.preventDefault();

          const { path } = selection.focus;
          const offset = editor.selection?.focus.offset || 0;

          const expressionRange: BaseRange = {
            anchor: { path, offset },
            focus: { path, offset },
          };

          commitPotentialFormula(editor, expressionRange, (ref) => {
            openEditor$.next(ref);
          });
        }
      } else if (!hasModifiers && event.key === 'Backspace') {
        const entry = getBlockAbove<CodeLineElement>(editor, {
          match: (n) => isElement(n) && n.type === ELEMENT_CODE_LINE,
        });

        if (!entry) return;

        const [node, path] = entry;

        const nodeText = getNodeString(node);

        if (
          lastFormattedBlock &&
          node.id === lastFormattedBlock.id &&
          nodeText === ''
        ) {
          event.preventDefault();

          setNodes(editor, { type: ELEMENT_PARAGRAPH }, { at: path });
          Transforms.insertText(
            editor as BaseEditor,
            lastFormattedBlock.oldText,
            { at: path }
          );

          delete store.lastFormattedBlock;
        } else if (nodeText === '' && node.children.length === 1) {
          // Empty code blocks get turned into a paragraph when backspace is pressed
          event.preventDefault();

          setNodes(editor, { type: ELEMENT_PARAGRAPH }, { at: path });
        }
      } else {
        delete store.lastFormattedBlock;
      }
    };
  },
});

const commitPotentialFormula = (
  editor: MyEditor,
  expressionRange: BaseRange,
  onCommit: (ref: ShadowCalcReference) => void,
  id = nanoid()
) => {
  const insertionPath = getAboveNodeSafe(editor as MyEditor, {
    at: expressionRange,
    match: (x) => isElementOfType(x, ELEMENT_PARAGRAPH),
  });

  if (!insertionPath) return;

  const codeLineBelow: CodeLineElement = {
    type: ELEMENT_CODE_LINE,
    id,
    children: [{ text: '' }],
  };

  const magicNumberInstead = {
    [MARK_MAGICNUMBER]: true,
    text: getExprRef(id),
  };

  const viewInstead = magicNumberInstead;

  insertNodes(editor, viewInstead, {
    voids: true,
    at: expressionRange,
  });

  const currentBlockEnd: Point = getEndPoint(editor, [
    expressionRange.anchor.path[0],
  ]);

  insertNodes(editor, codeLineBelow, { at: currentBlockEnd });

  setTimeout(() => {
    const domNode = toDOMNode(editor, magicNumberInstead);
    const dataNode = domNode?.querySelector<HTMLElement>('[data-number-id]');
    const numberId = dataNode?.dataset.numberId;

    if (!numberId) return;

    onCommit({
      numberId,
      codeLineId: codeLineBelow.id,
      numberNode: magicNumberInstead,
      codeLineNode: codeLineBelow,
    });
  }, 100);
};
