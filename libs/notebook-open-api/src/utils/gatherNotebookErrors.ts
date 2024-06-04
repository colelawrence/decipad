import type { NotebookError } from '../types';
import { formatError } from '@decipad/format';
import { type RootEditorController } from '@decipad/notebook-tabs';
import { fullRootEditorToProgram } from '@decipad/editor-language-elements';
import type {
  Computer,
  IdentifiedError,
  IdentifiedResult,
} from '@decipad/computer-interfaces';

const errorStringFromBlockResult = (
  blockResult: IdentifiedResult | IdentifiedError
): string => {
  if (blockResult.type === 'identified-error' && blockResult.error) {
    const { message, detailMessage } = blockResult.error;
    return `${message}${detailMessage ? `. ${detailMessage}` : ''}`;
  }
  const type = blockResult.result?.type;
  if (type?.kind === 'type-error') {
    return formatError('en-US', type.errorCause);
  }
  return 'unknown';
};

const errorFromBlockResult = (
  blockResult: IdentifiedResult | IdentifiedError
): NotebookError => ({
  elementId: blockResult.id,
  error: errorStringFromBlockResult(blockResult),
});

const isErrorBlockResult = (blockResult: IdentifiedResult | IdentifiedError) =>
  blockResult.type === 'identified-error' ||
  blockResult.result.type.kind === 'type-error';

export const gatherNotebookErrors = async (
  editor: RootEditorController,
  computer: Computer
): Promise<Array<NotebookError>> => {
  const program = await fullRootEditorToProgram(editor, computer);
  await computer.pushComputeDelta({ program: { upsert: program } });
  await computer.flush();
  return Object.values(computer.results.getValue().blockResults)
    .filter(isErrorBlockResult)
    .map(errorFromBlockResult);
};
