import { TOperation } from '@udecode/plate';
import { getNotebookContent } from '@decipad/backend-notebook-content';
import { debug } from '../debug';
import { suggestNewContentToFulfillRequest } from './suggestNewContentToFulfillRequest';
import { suggestEditorChanges } from './suggestEditorChanges';

export const notebookAssistant = async (
  notebookId: string,
  request: string
): Promise<TOperation[]> => {
  debug('notebookAssistant', { notebookId, request });
  const content = await getNotebookContent(notebookId);
  const newContent = await suggestNewContentToFulfillRequest(content, request);
  return suggestEditorChanges(content, newContent);
};
