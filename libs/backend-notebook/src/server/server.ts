import { notAcceptable } from '@hapi/boom';
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import stringify from 'json-stringify-safe';
import { getRemoteComputer } from '@decipad/remote-computer';
import {
  CustomAction,
  ActionResultWithNotebookError,
  callAction,
} from '@decipad/notebook-open-api';
import { getEditor } from './editor/getEditor';
import { attachEditorToBackend } from './attachEditorToBackend';
import { actions } from '../actions';

type MaybeWrappedInActionResult<T> = T | ActionResultWithNotebookError<T>;

export const server = async (
  notebookId: string | undefined,
  actionName: keyof typeof actions,
  params: Record<string, unknown>
): Promise<APIGatewayProxyStructuredResultV2> => {
  const action = actions[actionName] as CustomAction;
  if (!action) {
    throw notAcceptable(`Unknown function ${actionName as string}`);
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
      result = await callAction({
        editor,
        subEditor,
        computer,
        action,
        params,
      });
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
