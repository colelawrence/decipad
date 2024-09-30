import { MyEditor, MyElement } from '@decipad/editor-types';
import { Predicate } from '@udecode/plate-common';
import { MultipleNodeProxy } from '../proxy';
import { FC } from 'react';

export type ProxyFactoryConfig<
  N extends MyElement,
  P extends MultipleNodeProxy<N, any, any>
> = {
  key: string;
  match: Predicate<N>;
  factory: (nodes: N[]) => P;
};

export type AnyProxyFactoryConfig = ProxyFactoryConfig<any, any>;

export interface ProxyFormProps<T extends AnyProxyFactoryConfig> {
  proxy: ProxyForFactory<T>;
  editor: MyEditor;
}

/**
 * Input: An array of ProxyFactoryConfig objects
 * Output: An object mapping each factory key to a component for the proxy
 */
export type ProxyFormsByKey<T extends AnyProxyFactoryConfig[]> = {
  [key in KeyForFactory<T[number]>]: FC<
    ProxyFormProps<Extract<T[number], { key: key }>>
  >;
};

type ProxyForFactory<T extends AnyProxyFactoryConfig> = ReturnType<
  T['factory']
>;

type KeyForFactory<F extends AnyProxyFactoryConfig> = F['key'];
