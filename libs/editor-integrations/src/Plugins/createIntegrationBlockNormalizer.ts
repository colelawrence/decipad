import {
  NormalizerReturnValue,
  createNormalizerPlugin,
} from '@decipad/editor-plugins';
import {
  ELEMENT_INTEGRATION,
  IntegrationTypes,
  MyEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { setNodes } from '@udecode/plate';

export const createNormalizeIntegrationBlock = createNormalizerPlugin({
  name: 'NORMALIZE_INTEGRATION_BLOCK_PLUGIN',
  elementType: ELEMENT_INTEGRATION,
  plugin:
    (editor: MyEditor) =>
    (entry: MyNodeEntry): NormalizerReturnValue => {
      const [element, path] = entry;
      assertElementType(element, ELEMENT_INTEGRATION);

      // Type mapping were introduced after integrations were created
      // so we need to make sure a valid type mapping exists.
      if (!element.typeMappings) {
        return () =>
          setNodes(
            editor,
            {
              typeMappings: [],
            } satisfies Partial<IntegrationTypes.IntegrationBlock>,
            {
              at: path,
            }
          );
      }

      return false;
    },
});
