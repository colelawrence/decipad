import { createContext, useContext } from 'react';
import { Result } from '@decipad/computer';
import { BubbleFormula } from '@decipad/editor-types';

export type EditingBubble = {
  blockId: string;
  formula: BubbleFormula;
  deleteBubble(): void;
  updateValue(newFormula: BubbleFormula): void;
};

export type EditorBubblesContextValue = Readonly<{
  editing?: EditingBubble;
  codeResult?: Result.Result;
  setEditing(bubble?: EditingBubble): void;
}>;

const defaultValue: EditorBubblesContextValue = {
  setEditing() {},
};

export const EditorBubblesContext =
  createContext<EditorBubblesContextValue>(defaultValue);

export const useEditorBubblesContext = (): EditorBubblesContextValue => {
  return useContext(EditorBubblesContext);
};
