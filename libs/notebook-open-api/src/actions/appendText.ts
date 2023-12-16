import { getNode, insertNodes } from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { AnyElement, MyElement } from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { assertElementType } from '@decipad/editor-utils';
import { deserializeMd } from '@udecode/plate-serializer-md';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { Action } from './types';
import { appendPath } from '../utils/appendPath';

extendZodWithOpenApi(z);

export const appendText: Action<'appendText'> = {
  summary: 'Appends markdown text to the end of the notebook',
  description:
    'splits the markdown into separate elements and inserts them one at a time in the notebook',
  response: {
    schema: {
      ref: '#/components/schemas/CreateResults',
    },
  },
  parameterSchema: () =>
    z.object({
      markdownText: z
        .string()
        .openapi({ description: 'markdown text to add to the notebook' }),
    }),
  requiresNotebook: true,
  requiresRootEditor: false,
  returnsActionResultWithNotebookError: true,
  handler: (editor, { markdownText }) => {
    const tree = deserializeMd(editor, markdownText) as MyElement[];

    if (!Array.isArray(tree)) {
      throw new Error('Expected tree to be array');
    }

    const createdElements = [];

    for (const element of tree) {
      const newElement = {
        ...element,
        id: nanoid(),
      };
      const newElementPath = appendPath(editor);
      insertNodes(editor, [newElement], { at: newElementPath });
      const actualElement: MyElement | undefined = getDefined(
        getNode<MyElement>(editor, newElementPath)
      );
      assertElementType(actualElement, (element as AnyElement)?.type);
      createdElements.push({
        summary: `Added a new paragraph`,
        createdElementId: actualElement.id,
        createdElementType: actualElement.type,
        createdElementName: actualElement.id,
      });
    }

    return {
      summary: `Added new paragraph`,
      createdElements,
    };
  },
};
