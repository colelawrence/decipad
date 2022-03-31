import { KeyboardEvent } from 'react';
import { createPlateEditor, PlateEditor, PlatePlugin } from '@udecode/plate';
import { noop } from '@decipad/utils';
import { ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { createOnLeavePlugin } from '.';

type StrictPlugin = PlatePlugin & {
  type: string;
  options: NonNullable<PlatePlugin['options']>;
  inject: NonNullable<PlatePlugin['inject']>;
  editor: NonNullable<PlatePlugin['editor']>;
};

describe('createOnLeavePlugin', () => {
  let plugin: StrictPlugin;
  let onLeave: (() => void) | undefined;
  let editor: PlateEditor;
  beforeEach(() => {
    plugin = createOnLeavePlugin(() => {
      if (onLeave) {
        onLeave();
      }
    }) as StrictPlugin;

    editor = createPlateEditor({ plugins: [plugin] });
    editor.children = [
      {
        type: ELEMENT_CODE_LINE,
        children: [{ text: 'hey' }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
  });

  it('does not call on leave callback if any key other than Enter is pressed', () => {
    let onLeaveCalls = 0;
    onLeave = () => {
      onLeaveCalls += 1;
    };

    plugin.handlers?.onKeyDown?.(
      editor,
      plugin
    )({ code: 'Not Enter' } as KeyboardEvent);
    expect(onLeaveCalls).toBe(0);
  });

  it('calls on leave callback if Enter is pressed', () => {
    let onLeaveCalls = 0;
    onLeave = () => {
      onLeaveCalls += 1;
    };

    plugin.handlers?.onKeyDown?.(
      editor,
      plugin
    )({
      code: 'Enter',
      stopPropagation: noop,
      preventDefault: noop,
    } as KeyboardEvent);
    expect(onLeaveCalls).toBe(1);
  });
});
