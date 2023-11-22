import { create } from 'zustand';

export interface AISettingsStoreType {
  readonly generatingChatResponse: boolean;
  readonly generatingNotebookChanges: boolean;
  readonly shouldStopGeneratingChatResponse: boolean;
  readonly setGeneratingChatResponse: (value: boolean) => void;
  readonly setGeneratingNotebookChanges: (value: boolean) => void;
  readonly setShouldStopGeneratingChatResponse: (value: boolean) => void;
}

export const useAISettings = create<AISettingsStoreType>()((set) => {
  return {
    shouldStopGeneratingChatResponse: false,
    generatingChatResponse: false,
    generatingNotebookChanges: false,
    setGeneratingChatResponse: (value: boolean) => {
      set(() => {
        return {
          generatingChatResponse: value,
        };
      });
    },
    setGeneratingNotebookChanges: (value: boolean) => {
      set(() => {
        return {
          generatingNotebookChanges: value,
        };
      });
    },
    setShouldStopGeneratingChatResponse: (value: boolean) => {
      set(() => {
        return {
          shouldStopGeneratingChatResponse: value,
        };
      });
    },
  };
});
