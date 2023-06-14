import { FileType } from '@decipad/editor-types';
import { create } from 'zustand';

interface UploadFileStore {
  dialogOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;

  fileType?: FileType;
  setFileType: (fileType: FileType | undefined) => void;

  resetStore: () => void;
}

export const useFileUploadStore = create<UploadFileStore>((set) => ({
  dialogOpen: false,
  setDialogOpen: (isOpen: boolean) => set(() => ({ dialogOpen: isOpen })),

  fileType: undefined,
  setFileType: (type: FileType | undefined) =>
    set(() => ({
      fileType: type,
    })),

  resetStore: () =>
    set(() => ({
      dialogOpen: false,
      fileType: undefined,
    })),
}));
