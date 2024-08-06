export interface NotebookConnectionParams {
  url: string;
  token: string;
}

export interface NotebookProps {
  notebookId: string;
  workspaceId?: string;
  notebookMetaLoaded: boolean;
  onNotebookTitleChange: (title: string) => void;
  readOnly: boolean;
  secret?: string;
  connectionParams: NotebookConnectionParams | undefined;
  initialState?: string;
  getAttachmentForm: (
    file: File
  ) => Promise<undefined | [URL, FormData, string]>;
  onAttached: (handle: string) => Promise<undefined | { url: URL }>;
}
