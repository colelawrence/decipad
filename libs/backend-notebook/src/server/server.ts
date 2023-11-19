import { notAcceptable } from '@hapi/boom';
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import stringify from 'json-stringify-safe';
import { getRemoteComputer } from '@decipad/remote-computer';
import { actions } from '../actions';
import { getEditor } from './editor/getEditor';
import type { Action } from '../actions/types';
import { attachEditorToBackend } from './attachEditorToBackend';
import { ActionResultWithNotebookError } from '../types';
import { gatherNotebookErrors } from '../utils/gatherNotebookErrors';

type MaybeWrappedInActionResult<T> = T | ActionResultWithNotebookError<T>;

export const server = async (
  notebookId: string | undefined,
  actionName: keyof typeof actions,
  params: Record<string, unknown>
): Promise<APIGatewayProxyStructuredResultV2> => {
  const action = actions[actionName] as Action<typeof actionName>;
  if (!action) {
    throw notAcceptable(`Unknown function ${action}`);
  }
  const computer = await getRemoteComputer();

  if (!action.validateParams(params)) {
    throw notAcceptable('invalid parameters');
  }
  let result: MaybeWrappedInActionResult<ReturnType<typeof action.handler>>;
  if (action.requiresNotebook) {
    if (!notebookId || typeof notebookId !== 'string') {
      throw notAcceptable('need notebookId parameter in query string');
    }
    const editor = await getEditor({ notebookId, computer });
    const [, detach] = await attachEditorToBackend(editor);
    let subEditor = editor.getTabEditorAt(0);
    if (!subEditor) {
      editor.insertTab();
      subEditor = editor.getTabEditorAt(0);
    }
    try {
      result = await action.handler(subEditor, params);
      if (action.returnsActionResultWithNotebookError) {
        result = {
          result,
          notebookErrors: await gatherNotebookErrors(editor, computer),
        };
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      throw err;
    } finally {
      await detach();
    }
  } else {
    result = await action.handler(params);
  }
  // eslint-disable-next-line no-console
  console.log('result:', result);
  return {
    statusCode: 200,
    body: stringify(result),
  };
};
