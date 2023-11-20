import { Result } from '@decipad/remote-computer';
import { NotebookOpenApi } from '@decipad/notebook-open-api';
import { SplitCodeResult } from '@decipad/backend-code-assistant';

export interface CreateNotebookResult {
  createdNotebookId: string;
  createdNotebookURL: string;
}

export interface ServerSideNotebookApi extends NotebookOpenApi {
  createNotebook: (params: { title: string }) => CreateNotebookResult;
  evalCode: (params: { code: string }) => Result.Result;
  generateCode: (params: { prompt: string }) => SplitCodeResult | undefined;
}
