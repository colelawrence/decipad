import { useCallback, useRef, useEffect } from 'react';
import { Path, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { Element } from '@decipad/editor-types';
import { noop } from '@decipad/utils';

export const findDomNodePath = (editor: ReactEditor, node: Node): Path =>
  ReactEditor.findPath(editor, ReactEditor.toSlateNode(editor, node));

type EffectsFn<T> = (newValue: T) => void;

export const useElementMutatorCallback = <E extends Element>(
  editor: ReactEditor,
  element: E,
  propName: keyof E,
  effects: EffectsFn<E[typeof propName]> = noop
): ((newValue: E[typeof propName]) => void) => {
  const effectsRef = useRef<EffectsFn<E[typeof propName]>>(effects);
  useEffect(() => {
    effectsRef.current = effects;
  }, [effects]);

  return useCallback(
    (newValue: E[typeof propName]) => {
      const at = ReactEditor.findPath(editor, element);
      const mutation = {
        [propName]: newValue,
      } as unknown as Partial<E>;
      Transforms.setNodes(editor, mutation, { at });
      effectsRef.current(newValue);
    },
    [editor, element, propName]
  );
};
