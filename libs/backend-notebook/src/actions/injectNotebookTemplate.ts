import { getStoredSnapshot } from '@decipad/services/notebooks';
import { ServerSideNotebookApi } from '../types';
import { CustomAction } from '@decipad/notebook-open-api';
import { tables } from '@decipad/tables';
import { forbidden, notFound } from '@hapi/boom';
import { z } from 'zod';
import { verbalizeDoc } from '@decipad/doc-verbalizer';
import { ELEMENT_TAB, ELEMENT_TITLE, MyValue } from '@decipad/editor-types';
import {
  EElementOrText,
  getNodeString,
  insertNodes,
  isElement,
  withoutNormalizing,
} from '@udecode/plate-common';
import { debug } from '../debug';

const SNAPSHOT_NAME = 'Published 1';

export const injectNotebookTemplate: CustomAction<
  Parameters<ServerSideNotebookApi['injectNotebookTemplate']>[0],
  ReturnType<ServerSideNotebookApi['injectNotebookTemplate']>
> = {
  summary: 'injects the content of a notebook template into the notebook',
  parameterSchema: () =>
    z.object({
      notebookTemplateId: z.string(),
    }),
  response: {
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          elementId: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
        },
      },
    },
  },
  requiresNotebook: true,
  handler: async (editor, { notebookTemplateId }) => {
    const data = await tables();
    const template = await data.pads.get({ id: notebookTemplateId });
    if (!template) {
      throw notFound('no such template');
    }
    if (!template.isPublic || !template.isTemplate) {
      throw forbidden();
    }

    const content = (await getStoredSnapshot(notebookTemplateId, SNAPSHOT_NAME))
      ?.doc;
    if (!content) {
      throw new Error(
        `notebook template with id ${notebookTemplateId} has no content`
      );
    }
    debug(
      'injectNotebookTemplate: content',
      JSON.stringify(content, null, '\t')
    );
    const { verbalized } = verbalizeDoc(content);
    debug(
      'injectNotebookTemplate: verbalized:',
      JSON.stringify(verbalized, null, '\t')
    );

    let title = 'Title';
    withoutNormalizing(editor, () => {
      let insertPos = editor.children.length;
      for (const { element } of verbalized) {
        if (isElement(element)) {
          if (element.type === ELEMENT_TITLE) {
            title = getNodeString(element);
          } else {
            debug(
              'injectNotebookTemplate: about to insert element',
              JSON.stringify(element, null, '\t')
            );
            insertNodes(
              editor,
              [element as unknown as EElementOrText<MyValue>],
              {
                at: [insertPos],
              }
            );
            insertPos += 1;
            debug('inserted');
          }
        }
      }
    });

    return verbalizeDoc({
      children: [
        {
          type: ELEMENT_TITLE,
          id: 'title-id',
          children: [{ text: title }],
        },
        {
          type: ELEMENT_TAB,
          id: 'tab-id',
          name: 'First tab',
          children: editor.children,
        },
      ],
    }).verbalized.map((v) => ({
      elementId: v.element.id,
      type: v.element.type,
      description: v.verbalized,
    }));
  },
};
