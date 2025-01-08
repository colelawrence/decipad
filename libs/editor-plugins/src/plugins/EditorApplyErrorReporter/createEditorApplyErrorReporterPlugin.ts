import { captureException } from '@sentry/react';
import type { TOperation } from '@udecode/plate-common';
import { createOverrideApplyPluginFactory } from '@decipad/editor-plugin-factories';

const maxHistorySize = 50;

export const createEditorApplyErrorReporterPlugin =
  createOverrideApplyPluginFactory({
    name: 'USE_EDITOR_APPLY_ERROR_REPORTER',
    plugin: (editor, apply) => {
      const history: Array<TOperation> = [];

      const pushOp = (op: TOperation) => {
        history.push(op);
        if (history.length > maxHistorySize) {
          // remove oldest op from history
          history.shift();
        }
      };

      return (op: TOperation) => {
        pushOp(op);

        try {
          apply.call(editor, op);
        } catch (err) {
          console.error('Error caught in :', err);
          console.error('history:', history);
          captureException(err, {
            extra: {
              'editor.history': history,
              'editor.children': editor.children,
              'editor.apply.op': op,
            },
          });
          throw err;
        }
      };
    },
  });
