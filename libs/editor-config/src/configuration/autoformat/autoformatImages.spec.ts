import { beforeEach, expect, describe, it } from 'vitest';
import { Image } from '@decipad/editor-components';
import {
  createMyAutoformatPlugin,
  createMyPlateEditor,
  createMyPlugins,
  ELEMENT_H1,
  ELEMENT_IMAGE,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import { select, TEditor } from '@udecode/plate-common';
import { autoformatImages } from './autoformatImages';
import { createImagePlugin } from '@udecode/plate-media';

describe('autoformatting images from markdown', () => {
  let editor: TEditor;
  beforeEach(() => {
    editor = createMyPlateEditor({
      plugins: createMyPlugins(
        [
          createImagePlugin(),
          createMyAutoformatPlugin({ options: { rules: autoformatImages } }),
        ],
        {
          components: {
            [ELEMENT_IMAGE]: Image,
          },
        }
      ),
    });
    editor.children = [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }];
    select(editor, [0, 0]);
  });

  it('ignores input that is not a valid image', () => {
    editor.insertText('![a]b(c');
    editor.insertText(')');
    expect(editor.children).toMatchObject([
      { type: ELEMENT_PARAGRAPH, children: [{ text: '![a]b(c)' }] },
    ]);
  });

  it('ignores input outside a paragraph', () => {
    editor.children = [{ type: ELEMENT_H1, children: [{ text: '' }] }];
    editor.insertText('![a](b');
    editor.insertText(')');
    expect(editor.children).toMatchObject([
      { type: ELEMENT_H1, children: [{ text: '![a](b)' }] },
    ]);
  });
  it('ignores input that is already in a image', () => {
    editor.children = [
      {
        type: ELEMENT_PARAGRAPH,
        children: [
          { type: ELEMENT_IMAGE, url: 'href', children: [{ text: 'b' }] },
        ],
      },
    ];
    select(editor, { path: [0, 0, 0], offset: 2 });
    editor.insertText('![a](b)');
    expect(editor.children).toMatchObject([
      {
        type: ELEMENT_PARAGRAPH,
        children: [
          {
            type: ELEMENT_IMAGE,
            url: 'href',
            children: [{ text: 'b' }],
          },
        ],
      },
    ]);
  });

  it('splits off a image at the end', () => {
    editor.insertText('a![b](c');
    editor.insertText(')');
    expect(editor.children).toMatchObject([
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'a' }],
      },
      {
        type: ELEMENT_IMAGE,
        url: 'c',
        children: [{ text: 'b' }],
      },
    ]);
  });

  it('can handle line breaks', () => {
    editor.insertText('anb![c d](e');
    editor.insertText(')');
    expect(editor.children).toMatchObject([
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'anb' }],
      },
      {
        type: ELEMENT_IMAGE,
        url: 'e',
        children: [{ text: 'c d' }],
      },
    ]);
  });
});
