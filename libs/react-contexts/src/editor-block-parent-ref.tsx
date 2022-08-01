import {
  FC,
  MutableRefObject,
  PropsWithChildren,
  useEffect,
  useRef,
} from 'react';

interface EditorBlockParentRefProviderProps {
  onRefChange: (ref: MutableRefObject<HTMLElement | undefined>) => void;
}

export const EditorBlockParentRefProvider: FC<
  PropsWithChildren<EditorBlockParentRefProviderProps>
> = ({ onRefChange, children }) => {
  const parentRef = useRef<HTMLElement | undefined>(undefined);

  useEffect(() => {
    const i = setInterval(() => {
      const newParent = document.querySelector(
        'div[data-slate-editor="true"]'
      ) as HTMLDivElement;
      if (newParent && parentRef.current !== newParent) {
        // eslint-disable-next-line no-param-reassign
        parentRef.current = newParent;
        onRefChange(parentRef);
      }
    }, 1000);

    return () => clearInterval(i);
  });

  return <>{children}</>;
};
