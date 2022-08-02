import { MyEditor, MyElement } from '@decipad/editor-types';

type TransformerFn<T extends MyElement, RetT> = (
  editor: MyEditor,
  arg: T
) => RetT;

export const weakMapMemoizeInteractiveElementOutput = <
  T extends MyElement,
  RetT
>(
  fn: TransformerFn<T, RetT>
): TransformerFn<T, RetT> => {
  const cache = new WeakMap<T, RetT | null>();

  return (editor: MyEditor, arg: T) => {
    const cached = cache.get(arg) ?? fn(editor, arg);
    cache.set(arg, cached);
    return cached;
  };
};
