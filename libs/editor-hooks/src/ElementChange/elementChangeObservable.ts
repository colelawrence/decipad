import {
  ElementKind,
  MyElement,
  EditorObserverMessage,
  AnyElement,
} from '@decipad/editor-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEditorController } from '@decipad/editor-hooks';
import { extractTopLevelElements } from './extractTopLevelElements';

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
    const observer = controller?.elementObserver.CreateElementObserver(
      elementType,
      elementId
    );

    if (!observer) return;

    const observer$ = observer.subscribe(callback);

    callback('on-mount');

    return () => {
      observer$.unsubscribe();
    };
  }, [callback, controller?.elementObserver, elementId, elementType]);
}

type Element<T extends ElementKind> = Extract<MyElement, { type: T }>;

/**
 * Hook to get all the elements across all tabs of a specific kind.
 *
 * Taking in a predicate to run against top level elements on the notebook.
 */
export function useElements<
  TKind extends ElementKind,
  TElement extends Element<TKind>
>(elementType: TKind, predicate: (e: AnyElement) => boolean): Array<TElement> {
  const controller = useEditorController();

  const [elements, setElements] = useState<Array<TElement>>([]);

  const callback = useCallback(() => {
    const el = controller
      ? (extractTopLevelElements(controller).filter(
          predicate
        ) as Array<TElement>)
      : [];

    // Performance optimisation to reduce initial renders.
    setElements((oldElements) => {
      if (el.length === 0 && oldElements.length === 0) {
        return oldElements;
      }
      return el;
    });
  }, [controller, predicate]);

  useElementObserver(callback, elementType);

  return useMemo(() => elements, [elements]);
}
