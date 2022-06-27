import { AST } from '@decipad/computer';
import { MyEditor, MyElement } from '@decipad/editor-types';

export interface OutputNode {
  name: string;
  expression: AST.Expression;
}

type TransformerFn<T extends MyElement> = (
  editor: MyEditor,
  arg: T
) => OutputNode | null;

export const weakMapMemoizeInteractiveElementOutput = <T extends MyElement>(
  fn: TransformerFn<T>
): TransformerFn<T> => {
  const cache = new WeakMap<T, OutputNode | null>();

  return (editor: MyEditor, arg: T) => {
    const cached = cache.get(arg) ?? fn(editor, arg);
    cache.set(arg, cached);
    return cached;
  };
};
