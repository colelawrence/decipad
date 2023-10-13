import { getNotebookContent } from '@decipad/backend-notebook-content';
import { debug } from '../debug';
import { suggestNewContentToFulfillRequest } from './suggestNewContentToFulfillRequest';
import { suggestEditorChanges } from './suggestEditorChanges';
import { TOperation } from '@udecode/plate';
import { fixElementIds } from '../utils/fixElementIds';
import { RootDocument } from '@decipad/editor-types';
import { encodeDocumentIds } from '../utils/encodeDocumentIds';

export interface NotebookAssistantReply {
  operations: TOperation[];
  summary: string;
}

const internalNotebookAssistant = async (
  oldDocument: RootDocument,
  request: string
): Promise<NotebookAssistantReply> => {
  const [encodedOldDocument, decodeDocument] = encodeDocumentIds(oldDocument);

  const { newDocument: encodedNewDocument, summary } =
    await suggestNewContentToFulfillRequest(encodedOldDocument, request);
  const newDocument = decodeDocument(encodedNewDocument);
  return {
    operations: suggestEditorChanges(
      newDocument,
      fixElementIds(oldDocument, newDocument)
    ),
    summary,
  };
};

export const notebookAssistant = async (
  notebookId: string,
  request: string
): Promise<NotebookAssistantReply> => {
  debug('notebookAssistant', { notebookId, request });
  const oldDocument = await getNotebookContent(notebookId);
  return internalNotebookAssistant(oldDocument, request);
};
