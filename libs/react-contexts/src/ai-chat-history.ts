import { StateStorage, createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';

import { get as getIdb, set as setIdb, del as delIdb } from 'idb-keyval';
import { NotebookValue } from '@decipad/editor-types';
import { TOperation } from '@udecode/plate';

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

export type AIResponseStatus = 'success' | 'pending' | 'error';

export type UserMessage = {
  readonly id: string;
  readonly role: 'user';
  readonly content: string;
  readonly status?: never;
  readonly replyTo?: never;
};

type BaseAssistantMessage = {
  readonly id: string;
  readonly role: 'assistant';
  readonly status: AIResponseStatus;
  readonly replyTo: string;
};

type FunctionCallAssistantMessage = {
  readonly id: string;
  readonly role: 'assistant';
  readonly status: AIResponseStatus;
  readonly replyTo: string;
  readonly function_call: {
    arguments: {};
    name: 'make_changes';
  };
};

export type ReplyAssistantMessage = BaseAssistantMessage & {
  readonly content: string;
};

export type AssistantMessage =
  | FunctionCallAssistantMessage
  | ReplyAssistantMessage;

export type Message = UserMessage | AssistantMessage;

type Chat = {
  readonly [notebookId: string]: Message[];
};

export type ElapsedEventTime = {
  [event: string]: number;
};

export type Feedback = {
  prompt?: string;
  notebook?: NotebookValue;
  operations?: TOperation[];
  summary?: string;
  error?: string;
  elapsed?: ElapsedEventTime;
};

export interface AIChatHistoryType {
  readonly chats: Chat;
  readonly feedback: Feedback;
  readonly addMessage: (notebookId: string) => (message: Message) => void;
  readonly updateMessage: (notebookId: string) => (message: Message) => void;
  readonly deleteMessage: (notebookId: string) => (messageId: string) => void;
  readonly clearMessages: (notebookId: string) => () => void;
  readonly updateFeedback: (feedback: Feedback) => void;
  readonly updateFeedbackElaspedTime: (elapsed: ElapsedEventTime) => void;
  readonly clearFeedback: () => void;
}

export const useAIChatHistory = create<AIChatHistoryType>()(
  persist(
    (set) => {
      return {
        chats: {},
        feedback: {},
        addMessage: (notebookId: string) => (message: Message) => {
          set((state) => {
            if (!state.chats[notebookId]) {
              return {
                chats: {
                  ...state.chats,
                  [notebookId]: [message],
                },
              };
            }
            return {
              chats: {
                ...state.chats,
                [notebookId]: [...state.chats[notebookId], message],
              },
            };
          });
        },
        deleteMessage: (notebookId: string) => (messageId: string) => {
          set((state) => {
            if (!state.chats[notebookId]) {
              return state;
            }
            return {
              chats: {
                ...state.chats,
                [notebookId]: state.chats[notebookId].filter(
                  (message) => message.id !== messageId
                ),
              },
            };
          });
        },
        updateMessage: (notebookId: string) => (message: Message) => {
          set((state) => {
            if (!state.chats[notebookId]) {
              return state;
            }
            return {
              chats: {
                ...state.chats,
                [notebookId]: state.chats[notebookId].map((m) =>
                  m.id === message.id ? message : m
                ),
              },
            };
          });
        },
        clearMessages: (notebookId: string) => () => {
          set((state) => {
            if (!state.chats[notebookId]) {
              return state;
            }
            return {
              chats: {
                ...state.chats,
                [notebookId]: [],
              },
            };
          });
        },
        updateFeedback: (feedback: Partial<Feedback>) => {
          set((state) => {
            return {
              feedback: {
                ...state.feedback,
                ...feedback,
              },
            };
          });
        },
        updateFeedbackElaspedTime: (elapsed: ElapsedEventTime) => {
          set((state) => {
            return {
              feedback: {
                ...state.feedback,
                elapsed: {
                  ...state.feedback.elapsed,
                  ...elapsed,
                },
              },
            };
          });
        },
        clearFeedback: () => {
          set(() => {
            return {
              feedback: {},
            };
          });
        },
      };
    },
    {
      name: 'ai-chat-history',
      partialize(state) {
        return Object.fromEntries(
          Object.entries(state).filter(([key]) => !['feedback'].includes(key))
        );
      },
      storage: createJSONStorage(() => storage),
    }
  )
);
