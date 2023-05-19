import { dequal } from '@decipad/utils';
import {
  useEffect,
  createElement,
  Fragment,
  ReactNode,
  useState,
  useRef,
} from 'react';
import { BehaviorSubject } from 'rxjs';

export interface SelectableContext<T> {
  subject: BehaviorSubject<T>;
  Provider: React.ComponentType<{ value: T; children: ReactNode }>;
}

/**
 * Create a context that can be subscribed partially with `useSelectableContext`
 *
 * @example
 * const context = createSelectableContext({ a: 1, b: 2 })
 * // ... in a component somewhere
 * <context.Provider value={{ a: 2, b: 2 }}>
 *  ...children...
 * </context.Provider>
 */
export function createSelectableContext<T>(
  initialValue: T
): SelectableContext<T> {
  const subject = new BehaviorSubject(initialValue);

  const Provider = ({ children, value }: { children: ReactNode; value: T }) => {
    useEffect(() => {
      if (!dequal(subject.value, value)) {
        subject.next(value);
      }
    }, [value]);
    return createElement(Fragment, {}, children);
  };

  return { subject, Provider };
}

/**
 * use a context created with `createSelectableContext` as a hook.
 *
 * `selector` is passed to return a value from the context, usually some subset of it.
 *
 * @example
 * const context = createSelectableContext({ a: 1, b: 2 })
 * // ... in a component somewhere
 * const a = useSelectableContext(context, context => context.a)
 */
export function useSelectableContext<T, TRet>(
  ContextClass: SelectableContext<T>,
  selector: (context: T) => TRet
) {
  const [value, setValue] = useState(() =>
    selector(ContextClass.subject.value)
  );

  const selectorRef = useRef(selector);
  useEffect(() => {
    selectorRef.current = selector;
  }, [selector]);

  useEffect(() => {
    const sub = ContextClass.subject.subscribe((context) =>
      setValue((oldValue) => {
        const newValue = selectorRef.current(context);
        if (dequal(oldValue, newValue)) {
          return oldValue;
        }
        return newValue;
      })
    );
    return () => sub.unsubscribe();
  }, [ContextClass.subject]);

  return value;
}
