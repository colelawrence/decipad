import { create } from 'zustand';

export const DEFAULT_ASK_MODE_SYSTEM_PROMPT = `
Be fun and more human in your responses.
You are a chatbot inside Decipad prodcut.
You have access to markdown representation of a document user is working on.
Ask follow-up questions to get more information about what user is trying to do.
Keep your answers short and to the point.
Respond only in natural human language.
Answers questions and provide useful information about the document.
Answer general questions if asked.
`;

export const DEFAULT_CREATE_MODE_SYSTEM_PROMPT = `
Generate variable names only in PascalCase. Example: MyVariableName
If no function should be called respond with a short message indicating what you have done and asking for future instructions.
Be fun and more human in your responses if no function should be called.
`;

export const DEFAULT_AUTO_MODE_SYSTEM_PROMPT = `
You are responsible for determining intent of the user message.
Your only to options are 'conversation' and 'modelling'.
Conversation is when user is asking a question, making a statement or asking for help, implying they need to be asked follow-up questions, or you don't have sufficient information to suggest modelling.
Modelling is when user is making a change to the document, implying they don't need to be asked follow-up questions.
Respond with a valid JSON that represents chance of each intent.
Make sure JSON is valid and can be parsed by JSON.parse().
Example: { "conversation": 0.8, "modelling": 0.2 }
`;

export const DEFAULT_AI_CONFIG = {
  askMode: {
    systemPrompt: DEFAULT_ASK_MODE_SYSTEM_PROMPT,
    temperature: 0.7,
    usePretrainedModel: false,
    maxTokens: 800,
  },
  createMode: {
    systemPrompt: DEFAULT_CREATE_MODE_SYSTEM_PROMPT,
    temperature: 0.1,
    usePretrainedModel: false,
    maxTokens: 800,
  },
  autoMode: {
    systemPrompt: DEFAULT_AUTO_MODE_SYSTEM_PROMPT,
    temperature: 0.1,
    usePretrainedModel: false,
    maxTokens: 100,
  },
};

export type AIMode = 'ask' | 'create' | 'auto';

export type AIModeConfig = {
  readonly systemPrompt: string;
  readonly temperature: number;
  readonly usePretrainedModel: boolean;
  readonly maxTokens: number;
};

export type AIConfig = {
  readonly askMode: AIModeConfig;
  readonly createMode: AIModeConfig;
  readonly autoMode: AIModeConfig;
};

export interface AISettingsStoreType {
  readonly aiMode: AIMode;
  readonly generatingChatResponse: boolean;
  readonly generatingNotebookChanges: boolean;
  readonly shouldStopGeneratingChatResponse: boolean;
  readonly aiConfig: AIConfig;
  readonly setAIMode: (mode: AIMode) => void;
  readonly setGeneratingChatResponse: (value: boolean) => void;
  readonly setGeneratingNotebookChanges: (value: boolean) => void;
  readonly setShouldStopGeneratingChatResponse: (value: boolean) => void;
  readonly setAIConfig: (config: Partial<AIConfig>) => void;
  readonly resetAIConfig: () => void;
}

export const useAISettings = create<AISettingsStoreType>()((set) => {
  return {
    aiMode: 'auto',
    aiConfig: DEFAULT_AI_CONFIG,
    shouldStopGeneratingChatResponse: false,
    generatingChatResponse: false,
    generatingNotebookChanges: false,
    setAIMode: (mode: AIMode) => {
      set(() => {
        return {
          aiMode: mode,
        };
      });
    },
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
    setAIConfig: (config: Partial<AIConfig>) => {
      set((state) => {
        return {
          aiConfig: {
            ...state.aiConfig,
            ...config,
          },
        };
      });
    },
    resetAIConfig: () => {
      set(() => {
        return {
          aiConfig: DEFAULT_AI_CONFIG,
        };
      });
    },
  };
});
