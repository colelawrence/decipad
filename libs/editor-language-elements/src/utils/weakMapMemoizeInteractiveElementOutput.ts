import { AST } from '@decipad/computer';
import { MyElement } from '@decipad/editor-types';

export interface OutputNode {
  name: string;
  expression: AST.Expression;
}

type TransformerFn<T extends MyElement> = (arg: T) => OutputNode | null;

export const weakMapMemoizeInteractiveElementOutput = <T extends MyElement>(
  fn: TransformerFn<T>
): TransformerFn<T> => {
  const cache = new WeakMap<T, OutputNode | null>();

  return (arg: T) => {
    const cached = cache.get(arg) ?? fn(arg);
    cache.set(arg, cached);
    return cached;
  };
};
