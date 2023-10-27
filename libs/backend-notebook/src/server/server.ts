import { notAcceptable } from '@hapi/boom';
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import stringify from 'json-stringify-safe';
import { getRemoteComputer } from '@decipad/remote-computer';
import { actions } from '../actions';
import { getEditor } from './editor/getEditor';
import type { Action } from '../actions/types';
import { attachEditorToBackend } from './attachEditorToBackend';

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
  let result: ReturnType<typeof action.handler>;
  if (action.requiresNotebook) {
    if (!notebookId || typeof notebookId !== 'string') {
      throw notAcceptable('need notebookId parameter in query string');
    }
    const editor = await getEditor({ notebookId, computer });
    const [, detach] = await attachEditorToBackend(editor);
    let subEditor = editor.SubEditors[0];
    if (!subEditor) {
      editor.CreateTab();
      [subEditor] = editor.SubEditors;
    }
    result = await action.handler(subEditor, params);
    await detach();
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
