import { ElementKind } from '@decipad/editor-types';

type ElementInteraction = {
  interaction: 'interaction';
  element: ElementKind;
  parent?: ElementKind;
  variant?: string | undefined;
  text?: string;
};

type ElementCreation = {
  interaction: 'creation';
  element: ElementKind;
};

export type ChecklistEvent = {
  type: 'checklist';
  props: ElementInteraction | ElementCreation;
};
