import { notAcceptable, unauthorized } from '@hapi/boom';
import {
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
} from 'aws-lambda';
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
import { fetchNotebook } from './fetchNotebook';
import { track } from '@decipad/backend-analytics';
import { syncComputer } from './syncComputer';
import { thirdParty } from '@decipad/backend-config';

type MaybeWrappedInActionResult<T> = T | ActionResultWithNotebookError<T>;

const gptKey = thirdParty().openai.decipadGptBearerKey;

export const server = async (
  event: APIGatewayProxyEventV2,
  notebookId: string | undefined,
  actionName: keyof typeof actions,
  params: Record<string, unknown>
): Promise<APIGatewayProxyStructuredResultV2> => {
  // Will throw without API-key
  // We might want to change this in the future if we want to allow others
  // to edit notebooks.
  if (event.headers.authorization !== `Bearer ${gptKey}`) {
    throw unauthorized('API_KEY wrong');
  }

  const action = actions[actionName] as CustomAction;
  if (!action) {
    throw notAcceptable(`Unknown function ${actionName as string}`);
  }
  track(event, {
    event: `AI-Action:${actionName}`,
    properties: params,
  });

  const computer = getRemoteComputer();

  let result: MaybeWrappedInActionResult<ReturnType<typeof action.handler>>;
  if (action.requiresNotebook) {
    if (!notebookId || typeof notebookId !== 'string') {
      throw notAcceptable('need notebookId parameter in query string');
    }

    // validates user access
    await fetchNotebook(notebookId);

    const editor = await getEditor({ notebookId, computer });
    const [, detach] = await attachEditorToBackend(editor);
    await syncComputer(editor, computer);
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
    result = await action.handler(params, { computer });
  }
  // eslint-disable-next-line no-console
  console.log('result:', result);
  return {
    statusCode: 200,
    body: stringify(result),
  };
};
