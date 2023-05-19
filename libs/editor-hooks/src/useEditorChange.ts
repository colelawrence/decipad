import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Observable } from 'rxjs';
import type { PlateEditor } from '@udecode/plate';
import { dequal } from '@decipad/utils';
import { debounce } from 'lodash';
import { EditorChangeContext } from '@decipad/react-contexts';
import { MyValue, useTEditorRef } from '@decipad/editor-types';
import { useResolved } from '@decipad/react-utils';

export interface UseEditorChangeOptions {
  debounceTimeMs?: number;
  injectObservable?: Observable<undefined>;
}
export function useEditorChange<T>(
  selector: (editor: PlateEditor<MyValue>) => T,
  { debounceTimeMs = 100 }: UseEditorChangeOptions = {}
): T {
  const editor = useTEditorRef();
  const editorChanges = useContext(EditorChangeContext);
  const [state, setState] = useState(selector(editor));
  const lastState = useRef<T | undefined>();

  const setStateSafe = useCallback((v: T) => {
    if (!dequal(lastState.current, v)) {
      lastState.current = v;
      setState(v);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStateSafe(selector(editor));
    }, debounceTimeMs);
    return () => {
      clearTimeout(timeout);
    };
  }, [debounceTimeMs, editor, selector, setStateSafe]);

  const selectorRef = useRef(selector);
  selectorRef.current = selector;
  useEffect(() => {
    const subscriber = debounce(() => {
      const value = selectorRef.current(editor);
      setStateSafe(value);
    }, debounceTimeMs);
    const sub = editorChanges.subscribe(subscriber);

    return () => {
      subscriber.cancel();
      sub.unsubscribe();
    };
  }, [debounceTimeMs, editor, editorChanges, setStateSafe]);

  return state;
}

export function useEditorChangePromise<T>(
  selector: (editor: PlateEditor<MyValue>) => Promise<T>,
  options?: UseEditorChangeOptions
): T | undefined {
  return useResolved(useEditorChange(selector, options));
}

export function useEditorChangeCallback<T>(
  selector: (editor: PlateEditor<MyValue>) => T,
  callback: (v: T) => void,
  options?: UseEditorChangeOptions
) {
  const v = useEditorChange(selector, options);

  useEffect(() => {
    callback(v);
  }, [callback, v]);
}
