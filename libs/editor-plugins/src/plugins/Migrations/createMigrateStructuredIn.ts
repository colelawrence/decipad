/*
 * We have decided that structured code lines and structured inputs, will
 * be merged. Even though these are behind a feature flag it's good practice
 * to normalize them anyways.
 */

import {
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_STRUCTURED_IN,
  ELEMENT_STRUCTURED_IN_CHILD,
  ELEMENT_STRUCTURED_VARNAME,
  MyEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import { isElement, removeNodes, setNodes } from '@udecode/plate';
import {
  NormalizerReturnValue,
  createNormalizerPluginFactory,
} from '../../pluginFactories';

export const createMigrateStructuredInputs = createNormalizerPluginFactory({
  name: 'MIGRATE_STRUCTURED_IN_TO_CODELINE_V2',
  elementType: ELEMENT_STRUCTURED_IN,
  plugin:
    (editor: MyEditor) =>
    (entry: MyNodeEntry): NormalizerReturnValue => {
      const [node, path] = entry;
      if (isElement(node) && node.type === ELEMENT_STRUCTURED_IN) {
        if (
          node.children.length !== 2 ||
          node.children[0].type !== ELEMENT_STRUCTURED_VARNAME ||
          node.children[1].type !== ELEMENT_STRUCTURED_IN_CHILD
        ) {
          return () =>
            removeNodes(editor, {
              at: path,
            });
        }

        return () => {
          setNodes(
            editor,
            { type: ELEMENT_CODE_LINE_V2 },
            {
              at: path,
            }
          );
          setNodes(
            editor,
            { type: ELEMENT_CODE_LINE_V2_CODE },
            {
              at: [...path, 1],
            }
          );
        };
      }
      return false;
    },
});
