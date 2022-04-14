import { FC, PropsWithChildren } from 'react';
import { Element, RichText } from './elements';

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
export type PlateComponent<AdditionalProps = Record<never, never>> = FC<
  PropsWithChildren<
    (
      | {
          readonly attributes: ElementAttributes;
          readonly element: Element;
          readonly leaf?: undefined;
        }
      | {
          readonly attributes: LeafAttributes;
          readonly element?: undefined;
          readonly leaf: RichText;
        }
    ) &
      AdditionalProps
  >
>;
