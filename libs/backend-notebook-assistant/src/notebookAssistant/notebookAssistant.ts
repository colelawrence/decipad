import { getNotebookContent } from '@decipad/backend-notebook-content';
import { debug } from '../debug';
import { suggestNewContentToFulfillRequest } from './suggestNewContentToFulfillRequest';
import { suggestEditorChanges } from './suggestEditorChanges';
import { TOperation } from '@udecode/plate';

export interface NotebookAssistantReply {
  operations: TOperation[];
  summary: string;
}

export const notebookAssistant = async (
  notebookId: string,
  request: string
): Promise<NotebookAssistantReply> => {
  debug('notebookAssistant', { notebookId, request });
  const content = await getNotebookContent(notebookId);
  const { newDocument, summary } = await suggestNewContentToFulfillRequest(
    content,
    request
  );
  return {
    operations: suggestEditorChanges(content, newDocument),
    summary,
  };
};
