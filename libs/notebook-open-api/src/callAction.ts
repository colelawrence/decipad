import { type MyEditor } from '@decipad/editor-types';
import { type RemoteComputer } from '@decipad/remote-computer';
import { CustomAction } from './actions/types';
import { gatherNotebookErrors } from './utils/gatherNotebookErrors';
import { NotebookError } from './types';
import { EditorController } from '@decipad/notebook-tabs';

export interface CallActionOptions<Args extends Record<string, unknown>, Ret> {
  editor: EditorController;
  subEditor: MyEditor;
  computer: RemoteComputer;
  action: CustomAction<Args, Ret>;
  params: Args;
}

export type CallActionResult<Ret> =
  | Ret
  | { result: Ret; notebookErrors: Array<NotebookError> };

export const callAction = async <Args extends Record<string, unknown>, Ret>({
  editor,
  subEditor,
  computer,
  action,
  params,
}: CallActionOptions<Args, Ret>): Promise<CallActionResult<Ret>> => {
  let result: CallActionResult<Ret> = await (action.requiresNotebook
    ? action.handler(subEditor, params)
    : action.handler(params));

  if (action.requiresNotebook && action.returnsActionResultWithNotebookError) {
    result = {
      result,
      notebookErrors: await gatherNotebookErrors(editor, computer),
    };
  }
  return result;
};
