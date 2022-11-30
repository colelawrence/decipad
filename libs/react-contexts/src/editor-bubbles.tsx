import { createContext, useContext } from 'react';

export type ShadowCalcReference = {
  numberId: string;
  codeLineId: string;
};

export type ShadowCalcPortal = {
  element: HTMLElement;
  offsetY: number;
};

export type EditorBubblesContextValue = Readonly<{
  editing?: ShadowCalcReference;
  portal?: ShadowCalcPortal;

  setPortal(portal: ShadowCalcPortal): void;
  openEditor(params: ShadowCalcReference): void;
  closeEditor(codeLineId?: string): void;
}>;

const defaultValue: EditorBubblesContextValue = {
  setPortal() {},
  openEditor() {},
  closeEditor() {},
};

export const EditorBubblesContext =
  createContext<EditorBubblesContextValue>(defaultValue);

export const useEditorBubblesContext = (): EditorBubblesContextValue => {
  return useContext(EditorBubblesContext);
};
