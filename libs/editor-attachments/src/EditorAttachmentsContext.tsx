interface UploadingAttachment {
  file: File;
  progress: number;
}

interface EditorAttachmentsContextValue {
  uploading: Array<UploadingAttachment>;
}

export const defaultEditorAttachmentsContextValue =
  (): EditorAttachmentsContextValue => ({
    uploading: [],
  });
