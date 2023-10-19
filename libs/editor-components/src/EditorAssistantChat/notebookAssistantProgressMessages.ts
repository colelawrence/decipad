import { NotebookAssistantEventProgress } from './useNotebookAssistantTypes';

export const humanizeMotebookAssistantProgressMessage = (
  message: NotebookAssistantEventProgress
) => {
  // TODO: humanize this
  switch (message.action) {
    case 'asked for block ids':
    case 'asked for internal element ids':
    case 'asked to summarize changes':
    case 'generating decipad language code':
    case 'have block ids':
    case 'have decipad language code':
    case 'have instruction index':
    case 'have new version of the document':
    case 'have response from the agent':
    case 'have specific element ids':
    case 'have summary of changes':
    case 'sent initial instructions':
    case 'sent relevant blocks':
    case 'sent relevant instructions':
    case 'sent the relevant elements':
      return message.action;
  }
};
