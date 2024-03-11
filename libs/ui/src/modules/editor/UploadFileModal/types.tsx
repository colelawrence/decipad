import { FileType } from '@decipad/editor-types';

export interface UploadFileModalProps {
  fileType: FileType;
  onCancel: () => void;
  onUpload: (file: any, uploadType: string) => void;
  uploading: boolean;
  uploadProgress?: number;
  workspaceId: string;
}

export interface AddOns {
  giphy?: boolean;
  unsplash?: boolean;
  replicate?: boolean;
}

export interface DragAreaProps {
  processFile: (file?: File) => void;
  acceptHuman?: string | string[];
  fileType: string;
  maxSize: number;
  uploadProgress?: number;
}
