import {
  createTPlateEditor,
  ELEMENT_CODE_BLOCK,
  ELEMENT_PARAGRAPH,
  MyEditor,
  MyPlatePlugin,
} from '@decipad/editor-types';
import { createMarksPlugins, StrictPlugin } from './createMarksPlugins';

describe('Ctrl+b', () => {
  let editor: MyEditor;
  let plugins: MyPlatePlugin[];
  beforeEach(() => {
    plugins = createMarksPlugins();
    editor = createTPlateEditor({
      plugins,
    });
  });
  const pressCtrlB = () => {
    plugins.forEach((plugin) => {
      plugin.handlers?.onKeyDown?.(
        editor,
        plugin as StrictPlugin
      )?.(
        // @ts-expect-error DOM KeyboardEvent vs React event
        new KeyboardEvent('keydown', {
          key: 'b',
          ctrlKey: true,
          which: 66,
        })
      );
    });
  };

  it('turns text in a paragraph bold', () => {
    editor.children = [
      { type: ELEMENT_PARAGRAPH, children: [{ text: 'text' }] } as never,
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 'text'.length },
    };

    pressCtrlB();
    expect(editor.children[0].children[0]).toHaveProperty('bold', true);
  });

  it('is ignored in a code block', () => {
    editor.children = [
      { type: ELEMENT_CODE_BLOCK, children: [{ text: 'text' }] } as never,
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 'text'.length },
    };

    pressCtrlB();
    expect(editor.children[0].children[0]).not.toHaveProperty('bold');
  });
});
