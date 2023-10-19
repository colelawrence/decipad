import { TOperation } from '@udecode/plate';
import { RootDocument } from '@decipad/editor-types';

export interface NotebookAssistantReply {
  operations: TOperation[];
  summary: string;
}

export interface NotebookAssistantEventBegin {
  type: 'begin';
  connectionId: string;
}

export interface NotebookAssistantEventNewDoc {
  type: 'new-doc';
  newDoc: RootDocument;
}

export interface NotebookAssistantEventOperations {
  type: 'operations';
  operations: TOperation[];
}

export interface NotebookAssistantEventSummary {
  type: 'summary';
  summary: string;
}

export type NotebookAssistantEventProgressAction =
  | 'sent initial instructions'
  | 'have response from the agent' // generic
  | 'have instruction index'
  | 'asked for block ids'
  | 'have block ids'
  | 'sent relevant instructions'
  | 'asked for internal element ids'
  | 'have specific element ids'
  | 'sent the relevant elements'
  | 'sent relevant blocks'
  | 'generating decipad language code'
  | 'have decipad language code'
  | 'asked to summarize changes'
  | 'have summary of changes'
  | 'have new version of the document';

export interface NotebookAssistantEventProgress {
  type: 'progress';
  action: NotebookAssistantEventProgressAction;
}

export interface NotebookAssistantEventError {
  type: 'error';
  message: string;
  error: Error;
}

export interface NotebookAssistantEventEnd {
  type: 'end';
}

export type NotebookAssistantEvent =
  | NotebookAssistantEventBegin
  | NotebookAssistantEventNewDoc
  | NotebookAssistantEventProgress
  | NotebookAssistantEventOperations
  | NotebookAssistantEventSummary
  | NotebookAssistantEventError
  | NotebookAssistantEventEnd;
