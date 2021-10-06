import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  insertNodes,
  SPEditor,
  TElement,
} from '@udecode/plate';
import {
  ELEMENT_THEAD,
  ELEMENT_TBODY,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_HEAD_TR,
} from 'libs/editor/src/utils/elementTypes';
import { Editor, Location, Transforms } from 'slate';
import { InteractiveTable } from '../../InteractiveTable/table';

const tableElement: InteractiveTable = {
  type: ELEMENT_TABLE,
  children: [
    {
      type: ELEMENT_TABLE_CAPTION,
      children: [{ text: 'Table' }],
    },
    {
      type: ELEMENT_THEAD,
      children: [
        {
          type: ELEMENT_HEAD_TR,
          children: [
            {
              type: ELEMENT_TH,
              attributes: { cellType: 'string' },
              children: [{ text: 'FirstName' }],
            },
            {
              type: ELEMENT_TH,
              attributes: { cellType: 'string' },
              children: [{ text: 'LastName' }],
            },
          ],
        },
      ],
    },
    {
      type: ELEMENT_TBODY,
      children: [
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              attributes: { cellType: 'string' },
              children: [{ text: '' }],
            },
            {
              type: ELEMENT_TD,
              attributes: { cellType: 'string' },
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              attributes: { cellType: 'string' },
              children: [{ text: '' }],
            },
            {
              type: ELEMENT_TD,
              attributes: { cellType: 'string' },
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              attributes: { cellType: 'string' },
              children: [{ text: '' }],
            },
            {
              type: ELEMENT_TD,
              attributes: { cellType: 'string' },
              children: [{ text: '' }],
            },
          ],
        },
      ],
    },
  ],
};

export const formatTable = (editor: SPEditor, at: Location): void => {
  // insert a new table into the document
  insertNodes<TElement>(editor, tableElement, {
    match: (n) => Editor.isBlock(editor, n),
    at,
    select: true,
  });
  // Delete the empty paragraph element above the table
  Transforms.delete(editor, { at: Editor.before(editor, at), unit: 'block' });
};
