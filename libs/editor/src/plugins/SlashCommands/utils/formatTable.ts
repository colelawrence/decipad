import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  insertNodes,
  SPEditor,
  TElement,
} from '@udecode/plate';
import { Editor, Location, Transforms } from 'slate';

const tableElement = {
  type: ELEMENT_TABLE,
  children: [
    {
      type: ELEMENT_TR,
      attributes: { isHeader: true },
      children: [
        {
          type: ELEMENT_TH,
          attributes: { colspan: 2, title: true },
          children: [{ text: 'Table' }],
        },
      ],
    },
    {
      type: ELEMENT_TR,
      attributes: { isColumnNames: true },
      children: [
        {
          type: ELEMENT_TH,
          attributes: { colspan: '1' },
          children: [{ text: 'FirstName' }],
        },
        {
          type: ELEMENT_TH,
          attributes: { colspan: '1' },
          children: [{ text: 'LastName' }],
        },
      ],
    },
    {
      type: ELEMENT_TR,
      children: [
        {
          type: ELEMENT_TD,
          attributes: { colspan: '1' },
          children: [{ text: '' }],
        },
        {
          type: ELEMENT_TD,
          attributes: { colspan: '1' },
          children: [{ text: '' }],
        },
      ],
    },
    {
      type: ELEMENT_TR,
      children: [
        {
          type: ELEMENT_TD,
          attributes: { colspan: '1' },
          children: [{ text: '' }],
        },
        {
          type: ELEMENT_TD,
          attributes: { colspan: '1' },
          children: [{ text: '' }],
        },
      ],
    },
    {
      type: ELEMENT_TR,
      children: [
        {
          type: ELEMENT_TD,
          attributes: { colspan: '1' },
          children: [{ text: '' }],
        },
        {
          type: ELEMENT_TD,
          attributes: { colspan: '1' },
          children: [{ text: '' }],
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
