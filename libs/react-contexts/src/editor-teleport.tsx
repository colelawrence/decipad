import { TNode } from '@udecode/plate';
import { createContext, useContext } from 'react';
import { MyElement } from '@decipad/editor-types';

export type ShadowCalcReference = {
  numberId: string;
  numberNode: TNode;
  codeLineId: string;
  codeLineNode: TNode;
};

export type ShadowCalcPortal = {
  element: HTMLElement;
  offsetY: number;
};

export type EditorTeleportContextValue = Readonly<{
  editing?: ShadowCalcReference;
  portal?: ShadowCalcPortal;

  setPortal(portal: ShadowCalcPortal): void;
  openEditor(params: ShadowCalcReference): void;
  focusNumber(): void;
  closeEditor(codeLineId?: string, onClose?: () => void): void;
  useWatchTeleported(elementId: string, element: MyElement): void;
}>;

const defaultValue: EditorTeleportContextValue = {
  setPortal() {},
  openEditor() {},
  focusNumber() {},
  closeEditor() {},
  useWatchTeleported() {},
};

export const EditorTeleportContext =
  createContext<EditorTeleportContextValue>(defaultValue);

export const useEditorTeleportContext = (): EditorTeleportContextValue => {
  return useContext(EditorTeleportContext);
};
