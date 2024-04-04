import type { Result } from '@decipad/remote-computer';
import type {
  NotebookOpenApi,
  AllNotebookElementsDescriptionResult,
} from '@decipad/notebook-open-api';
import type { SplitCodeResult } from '@decipad/backend-code-assistant';

export interface CreateNotebookResult {
  createdNotebookId: string;
  createdNotebookURL: string;
}

export interface NotebookTemplate {
  id: string;
  title: string;
  summary?: string;
}

export interface SearchNotebookTemplatesResult {
  foundNotebookTemplates: Array<NotebookTemplate>;
}

export interface AssignNotebookResult {
  assigned: boolean;
}

export interface ServerSideNotebookApi extends NotebookOpenApi {
  createNotebook: (params: { title: string }) => CreateNotebookResult;
  evalCode: (params: { code: string }) => Result.Result;
  generateCode: (params: { prompt: string }) => SplitCodeResult | undefined;
  searchForNotebookTemplates: (params: {
    prompt: string;
    maxResults: number;
  }) => SearchNotebookTemplatesResult;
  injectNotebookTemplate: (params: {
    notebookTemplateId: string;
  }) => AllNotebookElementsDescriptionResult;
  assignNotebook: (params: {
    notebookId: string;
    userId: string;
  }) => AssignNotebookResult;
}
