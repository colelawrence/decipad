import {
  ElementKind,
  MyEditor,
  MyElement,
  MyPlatePlugin,
  EditorObserverMessage,
} from '@decipad/editor-types';
import { getNode, getNodeAncestors, isEditor, isElement } from '@udecode/plate';
import { useEffect } from 'react';
import { Observable, Subject, filter, finalize } from 'rxjs';
import { onSubscribe } from '@decipad/utils';

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
  editor: MyEditor,
  elementType: T,
  elementId?: string
): void {
  useEffect(() => {
    const observer = ElementObserverFactory(editor, elementType, elementId);
    if (!observer) return;

    const observer$ = observer.subscribe(callback);

    callback('on-mount');

    return () => {
      observer$.unsubscribe();
    };
  }, [callback, editor, elementId, elementType]);
}

/** Used to listen to changes on an element type, with support for narrowing down to a specific ID.
 * Note: The changes occur synchronously and AFTER they have been applied.
 *
 * Use with care, if you create an observer, and don't properly subscribe and unsubribe, this will
 * cause a memory leak. Use @see `useElementObserver` above if you want a managed life cycle for a react component
 *
 * @param @elementId provide this field if you want to listen to a specific element, with specific ID.
 */
export function ElementObserverFactory<T extends ElementKind>(
  editor: MyEditor,
  elementType: T,
  elementId?: string
): Observable<SpecificObserver<T>> | undefined {
  const observerPool = elementId
    ? editor.specificElementObserverPool
    : editor.elementObserverPool;

  if (!observerPool) return undefined;

  const mapKey = elementId ?? elementType;

  // --- Cache Check ---
  if (elementId && observerPool.has(elementId)) {
    return observerPool.get(elementId)?.observer as Observable<
      SpecificObserver<typeof elementType>
    >;
  }

  if (!elementId && observerPool.has(elementType)) {
    return observerPool.get(elementType)?.observer as Observable<
      SpecificObserver<typeof elementType>
    >;
  }
  // --- End Cache Check ---

  const newObserver = editor.changeObserver$?.pipe(
    onSubscribe(() => {
      const observer = observerPool.get(mapKey);
      if (observer) {
        observer.subsribers += 1;
        observerPool?.set(mapKey, observer);
      }
    }),
    filter((value): value is SpecificObserver<T> => {
      if (elementId) {
        return (
          value.element.type === elementType && value.element.id === elementId
        );
      }
      return value.element.type === elementType;
    }),
    finalize(() => {
      const observer = observerPool.get(mapKey);
      if (observer) {
        observer.subsribers -= 1;
        if (observer.subsribers <= 0) {
          observerPool.delete(mapKey);
        }
      }
    })
  );

  if (!newObserver) return undefined;
  observerPool.set(mapKey, { observer: newObserver, subsribers: 0 });

  return newObserver;
}

export function elementChangeFunction(editor: MyEditor): MyEditor {
  const { apply } = editor;
  if (!editor.changeObserver$) {
    // eslint-disable-next-line no-param-reassign
    editor.changeObserver$ = new Subject<EditorObserverMessage>();
  }

  if (!editor.specificElementObserverPool) {
    // eslint-disable-next-line no-param-reassign
    editor.specificElementObserverPool = new Map<
      string,
      { observer: Observable<EditorObserverMessage>; subsribers: number }
    >();
  }

  if (!editor.elementObserverPool) {
    // eslint-disable-next-line no-param-reassign
    editor.elementObserverPool = new Map<
      ElementKind,
      { observer: Observable<EditorObserverMessage>; subsribers: number }
    >();
  }

  // eslint-disable-next-line no-param-reassign
  editor.apply = (op) => {
    apply(op);

    if (
      Array.isArray(op.path) &&
      op.path.length > 0 &&
      (op.type === 'insert_text' ||
        op.type === 'remove_text' ||
        op.type === 'set_node' ||
        op.type === 'remove_node' ||
        op.type === 'insert_node')
    ) {
      const ancestors = Array.from(getNodeAncestors(editor, op.path));

      // --------- Edge Cases ---------

      // Because set_node on the element node itself (And not on any Leaf children)
      // We must add the element to the array, otherwise only the ancestors (elements above are added)
      if (op.type === 'set_node') {
        const node = getNode<MyElement>(editor, op.path);
        if (node) {
          ancestors.push([node, op.path]);
        }
      }

      // remove_node has already been appplied in :23, so we no longer have access to it.
      // so we must get it from the `op` object itself.
      if (op.type === 'remove_node') {
        if (isElement(op.node)) {
          ancestors.push([op.node as MyElement, op.path]);
        }
      }

      // --------- End Edge Cases ---------

      for (const [node] of ancestors) {
        if (!isEditor(node)) {
          editor.changeObserver$?.next({
            opType: op.type,
            element: node,
          });
        }
      }
    }
  };

  return editor;
}

export const createElementChangePlugin = (): MyPlatePlugin => {
  return {
    key: 'ELEMENT_CHANGE_PLUGIN',
    withOverrides: elementChangeFunction,
  };
};
