import type { FC, PropsWithChildren } from 'react';
import type { RichText } from './value';
import type { MyElement } from './nodes';

export interface ElementAttributes {
  'data-slate-node': 'element';
  'data-slate-inline'?: true;
  'data-slate-void'?: true;
  dir?: 'rtl';
  // from Slate attribute typings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: any;
}
export interface LeafAttributes {
  'data-slate-leaf': true;
}

export type PlateComponentAttributes = ElementAttributes | LeafAttributes;

export type PlateComponent<AdditionalProps = Record<never, never>> = FC<
  PropsWithChildren<
    | {
        readonly attributes: ElementAttributes;
        readonly className?: string;
        readonly element: MyElement;
        readonly leaf?: undefined;
        readonly text?: undefined;
      }
    | {
        readonly attributes: LeafAttributes;
        readonly className?: string;
        readonly element?: undefined;
        readonly leaf: RichText;
        readonly text: RichText;
      }
  > &
    AdditionalProps
>;
