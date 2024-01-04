import { StateStorage, createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';

import { get as getIdb, set as setIdb, del as delIdb } from 'idb-keyval';
import { IntegrationMessageData } from '@decipad/utils';

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

export type MessageType = 'user' | 'assistant' | 'event';
export type MessageStatus = 'pending' | 'success' | 'error' | 'ui-only-error';

export interface BaseMessage {
  readonly id: string;
  readonly type: MessageType;
  readonly status: MessageStatus;
  readonly replyTo?: string | null;
  readonly timestamp: number;
}

export interface UserMessage extends BaseMessage {
  readonly type: 'user';
  readonly content: string;
  readonly replyTo?: never;
}

export type SingleEvent = {
  readonly id: string;
  readonly content: string;
  readonly uiContent?: string;
  readonly function_call?: unknown;
  readonly result?: unknown;
  readonly element?: {
    label: string;
    id: string;
  };
};

export interface EventMessage extends BaseMessage {
  readonly type: 'event';
  /* Always goes to AI (therefore the real error message) */
  readonly content?: string;
  /* Used to override content if you want custom UI message. */
  readonly uiContent?: string;
  readonly replyTo: string | null;
  readonly events?: SingleEvent[];
}

export interface AssistantMessage extends BaseMessage {
  readonly type: 'assistant';
  readonly content: string;
  readonly replyTo: string | null;
  readonly suggestions?: string[];
  readonly integrationData?: IntegrationMessageData;
}

export type Message = UserMessage | AssistantMessage | EventMessage;

type Chat = {
  readonly [notebookId: string]: Message[];
};

type ThreadMap = {
  readonly [notebookId: string]: string;
};

export interface AIChatHistoryStoreType {
  readonly isFirstInteraction: boolean;
  readonly chats: Chat;
  readonly threads: ThreadMap;
  readonly addMessage: (notebookId: string) => (message: Message) => void;
  readonly deleteMessage: (notebookId: string) => (messageId: string) => void;
  readonly clearMessages: (notebookId: string) => () => void;
  readonly updateMessageStatus: (
    notebookId: string
  ) => (messageId: string, status: MessageStatus) => void;
  readonly addEventToMessage: (
    notebookId: string
  ) => (messageId: string, event: SingleEvent) => void;
  readonly mapThreadToChat: (notebookId: string) => (threadId: string) => void;
  readonly startInteraction: () => void;
}

export const useAIChatHistory = create<AIChatHistoryStoreType>()(
  persist(
    (set) => {
      return {
        isFirstInteraction: true,
        chats: {},
        threads: {},
        startInteraction: () => {
          set({ isFirstInteraction: false });
        },
        mapThreadToChat: (notebookId: string) => (threadId: string) => {
          set((state) => {
            return {
              threads: {
                ...state.threads,
                [notebookId]: threadId,
              },
            };
          });
        },
        addMessage: (notebookId: string) => (message: Message) => {
          set((state) => {
            return {
              chats: {
                ...state.chats,
                [notebookId]: [
                  ...(state.chats[notebookId] || []),
                  { ...message, timestamp: Date.now() },
                ],
              },
            };
          });
        },
        deleteMessage: (notebookId: string) => (messageId: string) => {
          set((state) => {
            return {
              chats: {
                ...state.chats,
                [notebookId]: state.chats[notebookId].filter(
                  (m) => m.id !== messageId
                ),
              },
            };
          });
        },
        updateMessageStatus:
          (notebookId: string) =>
          (messageId: string, status: MessageStatus) => {
            set((state) => {
              return {
                chats: {
                  ...state.chats,
                  [notebookId]: state.chats[notebookId].map((m) =>
                    m.id === messageId ? { ...m, status } : m
                  ),
                },
              };
            });
          },
        addEventToMessage:
          (notebookId: string) => (messageId: string, event: SingleEvent) => {
            set((state) => {
              return {
                chats: {
                  ...state.chats,
                  [notebookId]: state.chats[notebookId].map((m) =>
                    m.id === messageId && m.type === 'event'
                      ? {
                          ...m,
                          events: [...(m.events || []), event],
                        }
                      : m
                  ),
                },
              };
            });
          },
        clearMessages: (notebookId: string) => () => {
          set((state) => {
            return {
              chats: {
                ...state.chats,
                [notebookId]: [],
              },
            };
          });
        },
      };
    },
    {
      name: 'ai-chat-history',
      storage: createJSONStorage(() => storage),
    }
  )
);
