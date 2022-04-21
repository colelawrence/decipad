import { captureException } from '@sentry/browser';
import { Operation } from 'slate';
import { createOverrideApplyPluginFactory } from '../../pluginFactories';

const maxHistorySize = 50;

export const createEditorApplyErrorReporterPlugin =
  createOverrideApplyPluginFactory({
    name: 'USE_EDITOR_APPLY_ERROR_REPORTER',
    plugin: (editor, apply) => {
      const history: Array<Operation> = [];

      const pushOp = (op: Operation) => {
        history.push(op);
        if (history.length > maxHistorySize) {
          // remove oldest op from history
          history.shift();
        }
      };

      return (op: Operation) => {
        pushOp(op);

        try {
          apply.call(editor, op);
        } catch (err) {
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
