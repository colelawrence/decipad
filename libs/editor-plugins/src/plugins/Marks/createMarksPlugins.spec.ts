import { ELEMENT_CODE_BLOCK, ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import { createPlateEditor, PlateEditor, PlatePlugin } from '@udecode/plate';
import { createMarksPlugins, StrictPlugin } from './createMarksPlugins';

describe('Ctrl+b', () => {
  let editor: PlateEditor;
  let plugins: PlatePlugin[];
  beforeEach(() => {
    plugins = createMarksPlugins();
    editor = createPlateEditor({
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
      { type: ELEMENT_PARAGRAPH, children: [{ text: 'text' }] },
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
      { type: ELEMENT_CODE_BLOCK, children: [{ text: 'text' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 'text'.length },
    };

    pressCtrlB();
    expect(editor.children[0].children[0]).not.toHaveProperty('bold');
  });
});
