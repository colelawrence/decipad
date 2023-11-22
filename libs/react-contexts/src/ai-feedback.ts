import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { create } from 'zustand';

import { del as delIdb, get as getIdb, set as setIdb } from 'idb-keyval';
import { NotebookValue } from '@decipad/editor-types';
import { TOperation } from '@udecode/plate-common';

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await getIdb(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await setIdb(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await delIdb(name);
  },
};

export type ElapsedEventTime = {
  [event: string]: number;
};

export type AIFeedback = {
  prompt?: string;
  notebook?: NotebookValue;
  operations?: TOperation[];
  summary?: string;
  error?: string;
  elapsed?: ElapsedEventTime;
};

export type ResponseFeedback = {
  [id: string]: AIFeedback;
};

export interface AIFeedbackStoreType {
  readonly feedback: ResponseFeedback;
  readonly updateFeedback: (id: string, feedback: Partial<AIFeedback>) => void;
}

export const useAIFeedback = create<AIFeedbackStoreType>()(
  persist(
    (set) => {
      return {
        feedback: {},
        updateFeedback: (id: string, feedback: Partial<AIFeedback>) => {
          set((state) => {
            return {
              feedback: {
                ...state.feedback,
                [id]: {
                  ...state.feedback[id],
                  ...feedback,
                },
              },
            };
          });
        },
      };
    },
    {
      name: 'ai-feedback',
      storage: createJSONStorage(() => storage),
    }
  )
);
