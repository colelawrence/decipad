import {
  ElementKind,
  MyElement,
  EditorObserverMessage,
  ELEMENT_COLUMNS,
} from '@decipad/editor-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEditorController } from '@decipad/notebook-tabs';

export type SpecificObserver<T extends ElementKind> = EditorObserverMessage<
  Extract<MyElement, { type: T }>
>;

export type CallbackObserver<T extends ElementKind> = (
  value: SpecificObserver<T> | 'on-mount'
) => void;

/**
 * React hook to observer change in a type of element, or a specific element.
 * Life cycle fully managed, so no need to unsubscribe.
 *
 * Note: For better performance, use `useCallback` on the callback
 */
export function useElementObserver<T extends ElementKind>(
  callback: CallbackObserver<T>,
  elementType: T,
  elementId?: string
): void {
  const controller = useEditorController();

  useEffect(() => {
    const observer = controller?.ElementObserver.CreateElementObserver(
      elementType,
      elementId
    );

    if (!observer) return;

    const observer$ = observer.subscribe(callback);

    callback('on-mount');

    return () => {
      observer$.unsubscribe();
    };
  }, [callback, controller?.ElementObserver, elementId, elementType]);
}

type Element<T extends ElementKind> = Extract<MyElement, { type: T }>;

/**
 * Hook to get all the elements across all tabs of a specific kind.
 *
 * Taking in a predicate to run against top level elements on the notebook.
 */
export function useElements<T extends ElementKind>(
  elementType: T,
  predicate: (e: Element<T>) => boolean
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const refPredicate = useMemo(() => predicate, [elementType]);
  const controller = useEditorController();

  const [elements, setElements] = useState<Array<Element<T>>>([]);

  const callback = useCallback(() => {
    const el: Array<Element<T>> = [];
    // Iterate over SubEditors AKA tabs.
    for (const editor of controller?.SubEditors ?? []) {
      // We first must check the columns (as they can contain elements too).
      const elementsInColumns = editor.children
        .filter(
          (c): c is Element<typeof ELEMENT_COLUMNS> =>
            c.type === ELEMENT_COLUMNS
        )
        .flatMap((c) => c.children)
        .filter((c) => c.type === elementType)
        .filter(refPredicate as any) as Array<Element<T>>;

      el.push(...elementsInColumns);

      el.push(
        ...(editor.children
          .filter((c) => c.type === elementType)
          .filter(refPredicate as any) as Array<Element<T>>)
      );
    }

    // Performance optimisation to reduce initial renders.
    setElements((oldElements) => {
      if (el.length === 0 && oldElements.length === 0) {
        return oldElements;
      }
      return el;
    });
  }, [controller?.SubEditors, elementType, refPredicate]);

  useElementObserver(callback, elementType);

  return useMemo(() => elements, [elements]);
}
