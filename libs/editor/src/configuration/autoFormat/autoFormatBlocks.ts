import {
  AutoformatRule,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H2,
  ELEMENT_H3,
  TEditor,
} from '@udecode/plate';
import { Editor, Transforms } from 'slate';
import { insertCodeBlockBelow } from '../../utils/codeBlock';
import { getBlockParentPath } from '../../utils/path';
import { preFormat } from './utils/preFormat';

export const autoFormatBlocks: AutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_H2,
    match: '## ',
    preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_H3,
    match: '### ',
    preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_BLOCKQUOTE,
    match: '> ',
    preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_CODE_BLOCK,
    match: '```',
    triggerAtBlockStart: false,
    preFormat,
    format: (editor: TEditor): void => {
      if (!editor.selection) {
        throw new Error('Cannot autoformat code block without a selection');
      }
      const triggeringBlockPath = getBlockParentPath(
        editor,
        editor.selection.anchor.path
      );
      const triggeringBlockNowEmpty = !Editor.string(
        editor,
        triggeringBlockPath
      );

      insertCodeBlockBelow(editor, triggeringBlockPath, true);
      if (triggeringBlockNowEmpty) {
        Transforms.delete(editor, { at: triggeringBlockPath });
      }
    },
  },
];
