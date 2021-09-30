import {
  AutoformatRule,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_DEFAULT,
  ELEMENT_H2,
  ELEMENT_H3,
  getPlatePluginType,
  insertEmptyCodeBlock,
  SPEditor,
  TEditor,
} from '@udecode/plate';
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
      insertEmptyCodeBlock(editor as SPEditor, {
        defaultType: getPlatePluginType(editor as SPEditor, ELEMENT_DEFAULT),
        insertNodesOptions: { select: true },
      });
    },
  },
];
