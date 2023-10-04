import { StateStorage, createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';
import { ChatCompletionMessageParam } from 'openai/resources/chat';

import { get as getIdb, set as setIdb, del as delIdb } from 'idb-keyval';

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

export type AIResponseRating = 'like' | 'dislike';

export type RatedAIResponseBody = {
  userMessage: string;
  responseMessage: string;
};

export type RatedAIResponse = {
  readonly messageId: string;
  readonly body: RatedAIResponseBody;
  readonly rating: AIResponseRating;
};

export type Message =
  | (ChatCompletionMessageParam & {
      readonly id: string;
      readonly role: 'user';
      readonly replyTo?: never;
    })
  | (ChatCompletionMessageParam & {
      readonly id: string;
      readonly role: 'assistant';
      readonly replyTo: string;
    });

type Chat = {
  readonly [key: string]: Message[];
};

export interface AIChatHistoryType {
  readonly chats: Chat;
  readonly ratedResponses: RatedAIResponse[];
  readonly addMessage: (notebookId: string) => (message: Message) => void;
  readonly deleteMessage: (notebookId: string) => (messageId: string) => void;
  readonly clearMessages: (notebookId: string) => () => void;
  readonly rateResponse: (
    notebookId: string
  ) => (messageId: string, rating: AIResponseRating) => void;
}

export const useAIChatHistory = create<AIChatHistoryType>()(
  persist(
    (set) => {
      return {
        chats: {},
        ratedResponses: [],
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
        rateResponse:
          (notebookId: string) =>
          (messageId: string, rating: AIResponseRating) => {
            set((state) => {
              const isAlreadyRatedWithSameRating = state.ratedResponses.some(
                (response) =>
                  response.messageId === messageId && response.rating === rating
              );

              if (isAlreadyRatedWithSameRating) {
                return {
                  ratedResponses: state.ratedResponses.filter(
                    (response) =>
                      response.messageId !== messageId ||
                      response.rating !== rating
                  ),
                };
              }

              const isAlreadyRated = state.ratedResponses.some(
                (response) => response.messageId === messageId
              );

              const updatedRatedResponses = state.ratedResponses.map(
                (response) => {
                  if (response.messageId === messageId) {
                    return {
                      ...response,
                      rating,
                    };
                  }
                  return response;
                }
              );

              if (isAlreadyRated) {
                return {
                  ratedResponses: updatedRatedResponses,
                };
              }

              const userMessageRef = state.chats[notebookId]?.find(
                (message) => message.id === messageId
              )?.replyTo as string;

              const userMessage = state.chats[notebookId]?.find(
                (message) => message.id === userMessageRef
              )?.content as string;

              const responseMessage = state.chats[notebookId]?.find(
                (message) => message.id === messageId
              )?.content as string;

              const body: RatedAIResponseBody = {
                userMessage,
                responseMessage,
              };

              return {
                ratedResponses: [
                  ...state.ratedResponses,
                  {
                    messageId,
                    body,
                    rating,
                  },
                ],
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
