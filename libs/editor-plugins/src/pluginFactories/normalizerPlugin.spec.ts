import { createPlateEditor } from '@udecode/plate';
import { ELEMENT_EXPRESSION } from '@decipad/editor-types';
import { Descendant, Editor } from 'slate';
import { createNormalizerPluginFactory } from './normalizerPlugin';

describe('createNormalizerPluginFactory', () => {
  it('filters acceptable element properties', () => {
    const plugin = createNormalizerPluginFactory({
      name: 'test createNormalizerPlugin',
      elementType: ELEMENT_EXPRESSION,
      acceptableElementProperties: ['prop1', 'prop2'],
    });
    const editor = createPlateEditor({
      plugins: [plugin()],
    });
    editor.children = [
      {
        type: ELEMENT_EXPRESSION,
        prop1: 'value1',
        prop2: 'value2',
        prop3: 'value3',
        children: [{ text: '' }],
      },
    ];

    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      {
        type: ELEMENT_EXPRESSION,
        children: [
          {
            text: '',
          },
        ],
        prop1: 'value1',
        prop2: 'value2',
      },
    ]);
  });

  it('filters acceptable sub-elements', () => {
    const plugin = createNormalizerPluginFactory({
      name: 'test createNormalizerPlugin',
      elementType: ELEMENT_EXPRESSION,
      acceptableSubElements: ['el1', 'el2'],
    });
    const editor = createPlateEditor({
      plugins: [plugin()],
    });
    editor.children = [
      {
        type: ELEMENT_EXPRESSION,
        children: [
          {
            type: 'el1',
            children: [{ text: '' }],
          } as Descendant,
          {
            type: 'el2',
            children: [{ text: '' }],
          } as Descendant,
          {
            type: 'el3',
            children: [{ text: '' }],
          } as Descendant,
        ],
      },
    ];

    Editor.normalize(editor, { force: true });
    expect(editor.children).toEqual([
      {
        type: ELEMENT_EXPRESSION,
        children: [
          {
            type: 'el1',
            children: [{ text: '' }],
          } as Descendant,
          {
            type: 'el2',
            children: [{ text: '' }],
          } as Descendant,
        ],
      },
    ]);
  });
});
