import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_CODE_LINE,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_PARAGRAPH,
  MyEditor,
} from '@decipad/editor-types';
import { setNodes } from '@udecode/plate';
import { Path } from 'slate';

export const defaultTextConversions: { title: string; value: string }[] = [
  { title: 'Calculation', value: ELEMENT_CODE_LINE },
  { title: 'Callout', value: ELEMENT_CALLOUT },
  { title: 'Heading', value: ELEMENT_H2 },
  { title: 'Sub-heading', value: ELEMENT_H3 },
  { title: 'Paragraph', value: ELEMENT_PARAGRAPH },
  { title: 'Quote', value: ELEMENT_BLOCKQUOTE },
];

export const defaultConvertInto =
  (editor: MyEditor, at?: Path) => (value: string) => {
    setNodes(editor, { type: value }, { at });
  };
