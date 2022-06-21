import { WithRequired } from '@udecode/plate';
import {
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  TableCaptionElement,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';

export const createTableCaption = (
  props: WithRequired<Partial<TableCaptionElement>, 'id'>
): TableCaptionElement => ({
  type: ELEMENT_TABLE_CAPTION,
  children: [
    {
      id: nanoid(),
      type: ELEMENT_TABLE_VARIABLE_NAME,
      children: [{ text: '' }],
    },
  ],
  ...props,
});
