import type { TExcalidrawProps } from '@udecode/plate-ui-excalidraw';
import type { Mutable } from 'utility-types';
import type { BaseElement } from './value';
import type {
  ELEMENT_DRAW,
  ELEMENT_DRAW_IMAGE,
  ELEMENT_DIAMOND,
  ELEMENT_ELLIPSE,
  ELEMENT_FREEDRAW,
  ELEMENT_LINE,
  ELEMENT_LINEAR,
  ELEMENT_RECTANGLE,
  ELEMENT_SELECTION,
  ELEMENT_TEXT,
} from './element-kinds';

type DrawElementData = Partial<
  Omit<
    Mutable<Parameters<NonNullable<TExcalidrawProps['onChange']>>['0'][number]>,
    'text' | 'type'
  >
>;

export type DrawElementDescendant = Omit<BaseElement, 'type'> &
  DrawElementData & {
    id: string;
    children: [{ text: '' }];
    isHidden?: boolean;
    __text?: string;
    __dummy?: boolean;
    type:
      | typeof ELEMENT_DRAW
      | typeof ELEMENT_SELECTION
      | typeof ELEMENT_RECTANGLE
      | typeof ELEMENT_DIAMOND
      | typeof ELEMENT_ELLIPSE
      | typeof ELEMENT_TEXT
      | typeof ELEMENT_LINEAR
      | typeof ELEMENT_LINE
      | typeof ELEMENT_FREEDRAW
      | typeof ELEMENT_DRAW_IMAGE;
  };

export type DrawElements = Array<Readonly<DrawElementDescendant>>;
export interface DrawElement extends BaseElement {
  type: typeof ELEMENT_DRAW;
  children: DrawElements;
}
