import { MyPlatePlugin, MyElement } from '@decipad/editor-types';
import { isElementOfType } from '@decipad/editor-utils';
import { Path } from 'slate';
import { getBlockAbove, isCollapsed, setSelection } from '@udecode/plate';

export const createSelectionContainmentPlugin = (
  elType: MyElement['type']
): MyPlatePlugin => ({
  key: `CONTAIN_SELECTION_${elType}`,
  withOverrides: (editor) => {
    const prevOnChange = editor.onChange;

    let selectionFixerTimerHandle: Parameters<typeof clearTimeout>[0];
    // eslint-disable-next-line no-param-reassign
    editor.onChange = () => {
      prevOnChange();

      clearTimeout(selectionFixerTimerHandle);
      selectionFixerTimerHandle = setTimeout(() => {
        let anchorEntry;
        let focusEntry;
        if (
          editor.selection &&
          !isCollapsed(editor.selection) &&
          !Path.equals(
            editor.selection.anchor.path,
            editor.selection.focus.path
          ) &&
          (anchorEntry = getBlockAbove(editor, {
            at: editor.selection.anchor.path,
          })) &&
          (focusEntry = getBlockAbove(editor, {
            at: editor.selection.focus.path,
          })) &&
          !Path.equals(anchorEntry[1], focusEntry[1]) &&
          isElementOfType(anchorEntry[0], elType)
        ) {
          setSelection(editor, {
            anchor: editor.selection.anchor,
            focus: editor.selection.anchor,
          });
        }
      });
    };

    return editor;
  },
});
