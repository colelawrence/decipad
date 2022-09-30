import { ElementKind } from '@decipad/editor-types';

export type ElementInteraction = {
  action: 'element interaction';
  props: {
    element: ElementKind;
    parent?: ElementKind;
    variant?: string | undefined;
    text?: string;
  };
};

export type ElementCreation = {
  action: 'element creation';
  props: { element: ElementKind };
};

type Action =
  // Notebook operations
  | { action: 'notebook duplicated'; props?: undefined }
  | { action: 'notebook shared'; props?: undefined }
  | { action: 'notebook deleted'; props?: undefined }
  | { action: 'notebook created'; props?: undefined }
  // Visitor
  | { action: 'try decipad'; props?: undefined }
  // Editor actions
  | { action: 'number field updated'; props: { isReadOnly: boolean } }
  | { action: 'notebook share link copied'; props?: undefined }
  | { action: 'notebook get inspiration link clicked'; props?: undefined }
  | { action: 'notebook help link clicked'; props?: undefined }
  | { action: 'notebook code error docs link clicked'; props?: undefined }
  | { action: 'slash command'; props: { command: string } }
  | ElementInteraction
  | ElementCreation;

export type ActionEvent = {
  type: 'action';
} & Action;
