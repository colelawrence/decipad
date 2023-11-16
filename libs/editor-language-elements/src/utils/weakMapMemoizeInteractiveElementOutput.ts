import { RemoteComputer } from '@decipad/remote-computer';
import { AnyElement, MinimalRootEditor, MyEditor } from '@decipad/editor-types';

type TransformerFn<T extends AnyElement, RetT> = (
  editor: MinimalRootEditor | MyEditor,
  computer: RemoteComputer,
  arg: T
) => RetT;

export const weakMapMemoizeInteractiveElementOutput = <
  T extends AnyElement,
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
