import { FC } from 'react';
import { Element } from '../elements';

interface ElementAttributes {
  'data-slate-node': 'element';
  'data-slate-inline'?: true;
  'data-slate-void'?: true;
  dir?: 'rtl';
  // from Slate attribute typings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: any;
}
interface LeafAttributes {
  'data-slate-leaf': true;
}
export type PlateComponent = FC<
  | {
      readonly attributes: ElementAttributes;
      readonly element: Element;
    }
  | {
      readonly attributes: LeafAttributes;
      readonly element?: undefined;
    }
>;
