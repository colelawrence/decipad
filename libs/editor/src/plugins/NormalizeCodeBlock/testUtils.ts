import { createEditorPlugins } from '@udecode/plate';
import { Editor, Descendant } from 'slate';
import { CodeLineElement } from '../../utils/elements';
import { ELEMENT_CODE_LINE } from '../../utils/elementTypes';
import { createNormalizeCodeBlockPlugin } from './createNormalizeCodeBlockPlugin';

export function codeLine(code: string): CodeLineElement {
  return {
    type: ELEMENT_CODE_LINE,
    children: [
      {
        text: code,
      },
    ],
  };
}

export function createEmptyEditor(): Editor {
  const plugin = createNormalizeCodeBlockPlugin();
  return createEditorPlugins({ plugins: [plugin] });
}

export function createEditorWithEmptyCodeBlock(): Editor {
  const editor = createEmptyEditor();
  editor.children = [
    {
      type: 'code_block',
      children: [codeLine('')],
    } as Descendant,
  ];
  return editor;
}

export function createEditorWithTestNodes(): Editor {
  const editor = createEmptyEditor();
  editor.children = [
    {
      type: 'code_block',
      children: [codeLine('a = 1'), codeLine('t = {\n\n}'), codeLine('b = 2')],
    } as Descendant,
  ];
  return editor;
}
