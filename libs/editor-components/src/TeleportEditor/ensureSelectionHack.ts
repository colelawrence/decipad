import { MyEditor } from '@decipad/editor-types';

/**
 * After initial page load `editor.selection` is not set so `setSelection` does nothing.
 * We use this hack, but further investigation is needed ENG-1465.
 * This way we also make selection differ from the next one, so editorApply is triggered.
 *
 * @see  https://github.com/ianstormtaylor/slate/blob/f55026f0ba4eeea272ab33385ae2a43d3b3d65a0/packages/slate/src/transforms/selection.ts#L190-L192
 * */
export const ensureSelectionHack = (editor: MyEditor, force?: boolean) => {
  const { selection } = editor;
  if (!selection || force) {
    const path = [0];
    const hackSelection = {
      anchor: { path, offset: 0 },
      focus: { path, offset: 0 },
    };
    // eslint-disable-next-line no-param-reassign
    editor.selection = hackSelection;
  }
};
