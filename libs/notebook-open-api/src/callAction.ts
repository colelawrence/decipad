/* eslint-disable no-underscore-dangle */
import { type MyEditor } from '@decipad/editor-types';
import { type RemoteComputer } from '@decipad/remote-computer';
import { type RootEditorController } from '@decipad/notebook-tabs';
import { notAcceptable } from '@hapi/boom';
import { ZodFormattedError } from 'zod';
import { type CustomAction } from './actions/types';
import { gatherNotebookErrors } from './utils/gatherNotebookErrors';
import { type NotebookError } from './types';
import { debug } from './debug';

export interface CallActionOptions<Args extends Record<string, unknown>, Ret> {
  editor: RootEditorController;
  subEditor: MyEditor;
  computer: RemoteComputer;
  action: CustomAction<Args, Ret>;
  params: unknown;
}

export type CallActionResult<Ret> =
  | Ret
  | { result: Ret; notebookErrors: Array<NotebookError> };

const formatError = (formattedError: ZodFormattedError<unknown>) => {
  return Object.entries(formattedError)
    .filter(([key]) => key !== '_errors')
    .map(
      ([key, error]) =>
        `Error in key "${key}": ${(
          error as { _errors?: string[] }
        )?._errors?.join('. ')}`
    )
    .join('\n');
};

const parseParams = <Args extends Record<string, unknown>, Ret>(
  action: CustomAction<Args, Ret>,
  params: unknown
): Args => {
  debug('parseParams', params);
  const parseResult = action.parameterSchema().safeParse(params);
  if (!parseResult.success) {
    debug('params parsed successfully');
    throw notAcceptable(formatError(parseResult.error.format()));
  }
  // } catch (err) {
  //   if (err instanceof ZodError) {
  //     throw notAcceptable(err.toString());
  //   }
  //   throw notAcceptable((err as Error).message);
  // }
  return parseResult.data as Args;
};

export const callAction = async <Args extends Record<string, unknown>, Ret>({
  editor,
  subEditor,
  computer,
  action,
  params,
}: CallActionOptions<Args, Ret>): Promise<CallActionResult<Ret>> => {
  const parsedParams = parseParams(action, params);
  const context = { computer };
  let result: CallActionResult<Ret> = await (action.requiresNotebook
    ? action.handler(subEditor, parsedParams, context)
    : action.handler(parsedParams, context));

  if (action.requiresNotebook && action.returnsActionResultWithNotebookError) {
    result = {
      result,
      notebookErrors: await gatherNotebookErrors(editor, computer),
    };
  }
  return result;
};
