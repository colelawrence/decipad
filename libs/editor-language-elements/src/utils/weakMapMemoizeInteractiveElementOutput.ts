import { RemoteComputer } from '@decipad/remote-computer';
import { MyEditor, MyElement } from '@decipad/editor-types';

type TransformerFn<T extends MyElement, RetT> = (
  editor: MyEditor,
  computer: RemoteComputer,
  arg: T
) => RetT;

export const weakMapMemoizeInteractiveElementOutput = <
  T extends MyElement,
  RetT
>(
  fn: TransformerFn<T, RetT | Promise<RetT>>
): TransformerFn<T, Promise<RetT>> => {
  const cache = new WeakMap<T, RetT | null>();

  return async (editor, computer, arg) => {
    const cached = cache.get(arg) ?? (await fn(editor, computer, arg));
    cache.set(arg, cached);
    return cached;
  };
};
