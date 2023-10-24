import {
  EditorObserverMessage,
  ElementKind,
  MyEditor,
  MyElement,
} from '@decipad/editor-types';
import { onSubscribe } from '@decipad/utils';
import { Observable, Subject, filter, finalize } from 'rxjs';
import { getNode, getNodeAncestors, isEditor, isElement } from '@udecode/plate';

export type SpecificObserver<T extends ElementKind> = EditorObserverMessage<
  Extract<MyElement, { type: T }>
>;

export type CallbackObserver<T extends ElementKind> = (
  value: SpecificObserver<T> | 'on-mount'
) => void;

/**
 * Listens to changes on an apply function.
 */
export class ElementObserver {
  public elementObserverPool: Map<
    ElementKind,
    { observer: Observable<EditorObserverMessage>; subsribers: number }
  >;

  public specificElementObserverPool: Map<
    string,
    { observer: Observable<EditorObserverMessage>; subsribers: number }
  >;
  public changeObserver$: Subject<EditorObserverMessage>;

  constructor() {
    this.elementObserverPool = new Map();
    this.specificElementObserverPool = new Map();
    this.changeObserver$ = new Subject();
  }

  /**
   * Overrides the editors 'apply' function
   * to capture changes.
   */
  public OverrideApply(editor: MyEditor) {
    const { apply } = editor;

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
            this.changeObserver$.next({
              opType: op.type,
              element: node,
            });
          }
        }
      }
    };
  }

  /** Used to listen to changes on an element type, with support for narrowing down to a specific ID.
   * Note: The changes occur synchronously and AFTER they have been applied.
   *
   * Use with care, if you create an observer, and don't properly subscribe and unsubribe, this will
   * cause a memory leak. Use @see `useElementObserver` above if you want a managed life cycle for a react component
   *
   * @param @elementId provide this field if you want to listen to a specific element, with specific ID.
   */
  public CreateElementObserver<T extends ElementKind>(
    elementType: T,
    elementId?: string
  ): Observable<SpecificObserver<T>> {
    const observerPool = elementId
      ? this.specificElementObserverPool
      : this.elementObserverPool;

    const mapKey = elementId ?? elementType;

    if (observerPool.has(mapKey)) {
      return observerPool.get(mapKey)!.observer as Observable<
        SpecificObserver<typeof elementType>
      >;
    }

    const newObserver = this.changeObserver$.pipe(
      onSubscribe(() => {
        const observer = observerPool.get(mapKey);
        if (observer) {
          observer.subsribers += 1;
          observerPool?.set(mapKey, observer);
        }
      }),
      filter((value): value is SpecificObserver<T> => {
        // To make typechecking happy.
        if (!('type' in value.element)) return false;
        if (!('id' in value.element)) return false;

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

    observerPool.set(mapKey, { observer: newObserver, subsribers: 0 });
    return newObserver;
  }
}
