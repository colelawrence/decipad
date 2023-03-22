import { MyEditor } from '@decipad/editor-types';
import { insertNodes, withoutNormalizing } from '@udecode/plate';
import { isFlagEnabled } from '@decipad/feature-flags';
import { createDefaultNotebook } from '@decipad/editor-utils';
import InitialNotebook from '../initial-notebook';

export function ensureInitialDocument(editor: MyEditor): void {
  const { children, withoutCapturingUndo } = editor;

  function createInitNotebook() {
    if (isFlagEnabled('POPULATED_NEW_NOTEBOOK')) {
      createPopulatedNotebook(editor);
    } else {
      createDefaultNotebook(editor);
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
