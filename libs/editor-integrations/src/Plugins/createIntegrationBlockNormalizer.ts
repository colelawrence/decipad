import { type NormalizerReturnValue } from '@decipad/editor-plugins';
import {
  ELEMENT_INTEGRATION,
  IntegrationTypes,
  MyEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { setNodes } from '@udecode/plate-common';

// Weird import because Jest will complain
import { createNormalizerPlugin } from '../../../editor-plugins/src/pluginFactories';
import { getNotionDataLink, getNotionDbLink } from '../utils';
import type { DeepPartial } from 'utility-types';

function isValidURL(stringUrl: string): boolean {
  try {
    // new URL throws if url is not valid
    // eslint-disable-next-line no-new
    new URL(stringUrl);
    return true;
  } catch (e) {
    return false;
  }
}

function isCorrectOrigin(stringUrl: string): boolean {
  const url = new URL(stringUrl);
  return url.origin === window.location.origin;
}

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

      if (element.integrationType.type === 'notion') {
        const url = element.integrationType.notionUrl;
        const notionDatabaseId = getNotionDbLink(url);

        //
        // We have the old format: `notion.so/id....`.
        // Let's point it to new URL.
        //
        if (notionDatabaseId != null) {
          return () => {
            setNodes(
              editor,
              {
                integrationType: {
                  ...element.integrationType,
                  type: 'notion',
                  notionUrl: getNotionDataLink(notionDatabaseId),
                },
              } satisfies DeepPartial<IntegrationTypes.IntegrationBlock>,
              { at: path }
            );
          };
        }

        if (isValidURL(url) && !isCorrectOrigin(url)) {
          const currentUrl = new URL(url);
          const urlPath = currentUrl.toString().slice(currentUrl.origin.length);
          const newUrl = `${window.location.origin}${urlPath}`;

          return () => {
            setNodes(
              editor,
              {
                integrationType: {
                  ...element.integrationType,
                  type: 'notion',
                  notionUrl: newUrl,
                },
              } satisfies DeepPartial<IntegrationTypes.IntegrationBlock>,
              { at: path }
            );
          };
        }
      }

      return false;
    },
});
