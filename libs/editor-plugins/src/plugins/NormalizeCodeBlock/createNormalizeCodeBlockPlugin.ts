/* eslint-disable no-param-reassign */
import {
  DeprecatedCodeBlockElement,
  CodeLineElement,
  DEPRECATED_ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  MyEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import {
  ChildOf,
  getNodeChildren,
  isElement,
  isText,
  unwrapNodes,
  wrapNodes,
} from '@udecode/plate';
import {
  NormalizerReturnValue,
  createNormalizerPluginFactory,
} from '../../pluginFactories';
import { codeBlockToCode } from './codeBlockToCode';
import { reconcileStatements } from './reconcileStatements';
import { splitCodeIntoStatements } from './splitCodeIntoStatements';

const normalizeCodeBlock =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): NormalizerReturnValue => {
    const [node, path] = entry;

    // Code block legacy component
    if (isElement(node) && node.type === DEPRECATED_ELEMENT_CODE_BLOCK) {
      for (const blockChild of getNodeChildren<
        ChildOf<DeprecatedCodeBlockElement>
      >(editor, path)) {
        const [blockChildNode, blockChildPath] = blockChild;

        // Element children must be code lines, else unwrap their text
        if (
          isElement(blockChildNode) &&
          blockChildNode.type !== ELEMENT_CODE_LINE
        ) {
          return () => unwrapNodes(editor, { at: blockChildPath });
        }

        // Text must be wrapped in a code line
        if (isText(blockChildNode)) {
          return () =>
            wrapNodes(
              editor,
              {
                type: ELEMENT_CODE_LINE,
                children: [],
              } as unknown as CodeLineElement,
              {
                at: blockChildPath,
              }
            );
        }
      }

      // At this point the normalization has ensured a matching structure
      const codeBlockNode = node as DeprecatedCodeBlockElement;

      // Split and merge lines to match statements
      const blockCode = codeBlockToCode(codeBlockNode);
      const statements = splitCodeIntoStatements(blockCode);
      if (statements.length) {
        const normalize = reconcileStatements(editor, statements, path);
        if (normalize) {
          return normalize;
        }
      }

      // We don't use code blocks anymore so we unwrap their code lines.
      return () => unwrapNodes(editor, { at: path });
    }
    return false;
  };

export const createNormalizeCodeBlockPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_CODE_BLOCK_PLUGIN',
  elementType: DEPRECATED_ELEMENT_CODE_BLOCK,
  acceptableSubElements: [ELEMENT_CODE_LINE],
  plugin: normalizeCodeBlock,
});
