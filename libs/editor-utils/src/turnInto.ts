import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_CODE_LINE,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_PARAGRAPH,
  MyEditor,
  MyElement,
} from '@decipad/editor-types';
import { findNodePath, focusEditor, setNodes } from '@udecode/plate';

export const defaultTextConversions: { title: string; value: string }[] = [
  { title: 'Calculation', value: ELEMENT_CODE_LINE },
  { title: 'Callout', value: ELEMENT_CALLOUT },
  { title: 'Heading', value: ELEMENT_H2 },
  { title: 'Sub-heading', value: ELEMENT_H3 },
  { title: 'Paragraph', value: ELEMENT_PARAGRAPH },
  { title: 'Quote', value: ELEMENT_BLOCKQUOTE },
];

export const defaultConvertInto =
  (editor: MyEditor, element: MyElement) => (value: string) => {
    setNodes(editor, { type: value }, { at: findNodePath(editor, element) });
    focusEditor(editor);
  };
