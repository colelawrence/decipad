import {
  toggleList,
  unwrapList,
  WithAutoformatOptions,
} from '@udecode/slate-plugins';
import { Editor } from 'slate';

export const autoFormatOptions: WithAutoformatOptions = {
  rules: [
    {
      type: 'h1',
      markup: '#',
      preFormat: (editor: Editor) => unwrapList(editor),
    },
    {
      type: 'h2',
      markup: '##',
      preFormat: (editor: Editor) => unwrapList(editor),
    },
    {
      type: 'h3',
      markup: '###',
      preFormat: (editor: Editor) => unwrapList(editor),
    },
    {
      type: 'h4',
      markup: '####',
      preFormat: (editor: Editor) => unwrapList(editor),
    },
    {
      type: 'h5',
      markup: '#####',
      preFormat: (editor: Editor) => unwrapList(editor),
    },
    {
      type: 'h6',
      markup: '######',
      preFormat: (editor: Editor) => unwrapList(editor),
    },
    {
      type: 'bold',
      between: ['**', '**'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: 'italic',
      between: ['*', '*'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: 'underline',
      between: ['_', '_'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: 'strikethrough',
      between: ['~~', '~~'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: 'highlight',
      between: ['==', '=='],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: 'blockquote',
      markup: ['>'],
      preFormat: (editor: Editor) => unwrapList(editor),
    },
    {
      type: 'code',
      between: ['`', '`'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: 'action_item',
      markup: '[ ]',
      preFormat: (editor: Editor) => unwrapList(editor),
    },
    {
      type: 'code_block',
      markup: ['```'],
      preFormat: (editor: Editor) => unwrapList(editor),
    },
    {
      type: 'li',
      markup: ['*', '-'],
      preFormat: (editor: Editor) => unwrapList(editor),
      format: (editor) => toggleList(editor, { typeList: 'ul' }),
    },
    {
      type: 'li',
      markup: ['1.', '1-', '1)'],
      preFormat: (editor: Editor) => unwrapList(editor),
      format: (editor) => toggleList(editor, { typeList: 'ol' }),
    },
    {
      type: 'divider',
      markup: ['---'],
      mode: 'block',
      preFormat: (editor: Editor) => unwrapList(editor),
    },
  ],
};
