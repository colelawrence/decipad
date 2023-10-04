import { MyEditor } from '@decipad/editor-types';
import { insertNodes, withoutNormalizing } from '@udecode/plate';
import { isFlagEnabled } from '@decipad/feature-flags';
import { createDefaultNotebook } from '@decipad/editor-utils';
import InitialNotebook from '../initial-notebook';

export function ensureInitialDocument(editor: MyEditor): void {
  const { children, withoutCapturingUndo } = editor;

  function createInitNotebook() {
    try {
      if (isFlagEnabled('POPULATED_NEW_NOTEBOOK')) {
        try {
          createPopulatedNotebook(editor);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error creating populated notebook');
          createDefaultNotebook(editor);
        }
      } else {
        createDefaultNotebook(editor);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error initialising notebook', err);
    }
  }

  if (children.length > 1) {
    return;
  }

  if (children.length === 0) {
    if (withoutCapturingUndo) {
      withoutCapturingUndo(createInitNotebook);
      return;
    }
    createInitNotebook();
  }
}

function createPopulatedNotebook(editor: MyEditor) {
  withoutNormalizing(editor, () => {
    insertNodes(editor, InitialNotebook as any, { at: [0] });
  });
}
