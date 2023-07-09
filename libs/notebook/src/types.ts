import { Computer } from '@decipad/computer';
import { DocSyncEditor } from '@decipad/docsync';
import { MyEditor } from '@decipad/editor-types';
import { ExternalDataSourcesContextValue } from '@decipad/interfaces';

export interface NotebookConnectionParams {
  url: string;
  token: string;
}

export interface NotebookProps {
  notebookId: string;
  workspaceId?: string;
  notebookMetaLoaded: boolean;
  notebookTitle: string;
  onNotebookTitleChange: (newValue: string) => void;
  readOnly: boolean;
  secret?: string;
  connectionParams: NotebookConnectionParams | undefined;
  initialState?: string;
  onEditor: (editor: MyEditor) => void;
  onDocsync: (docsync: DocSyncEditor) => void;
  onComputer: (computer: Computer) => void;
  getAttachmentForm: (
    file: File
  ) => Promise<undefined | [URL, FormData, string]>;
  onAttached: (handle: string) => Promise<undefined | { url: URL }>;
  useExternalDataSources: (
    notebookId: string
  ) => ExternalDataSourcesContextValue;
}
