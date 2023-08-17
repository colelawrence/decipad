import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  concatMap,
  debounceTime,
  distinctUntilChanged,
  type Observable,
} from 'rxjs';
import type { PlateEditor } from '@udecode/plate';
import { dequal } from '@decipad/utils';
import debounce from 'lodash.debounce';
import { EditorChangeContext } from '@decipad/react-contexts';
import { MyEditor, MyValue, useTEditorRef } from '@decipad/editor-types';

export interface UseEditorChangeOptions {
  debounceTimeMs?: number;
  injectObservable?: Observable<undefined>;
}
export function useExternalEditorChange<T>(
  editor: MyEditor | undefined,
  selector: (ed: MyEditor) => T,
  { debounceTimeMs = 100 }: UseEditorChangeOptions = {}
): T | undefined {
  const editorChanges = useContext(EditorChangeContext);
  const [state, setState] = useState(editor && selector(editor));
  const lastState = useRef<T | undefined>(state);

  const setStateSafe = useCallback((v: T) => {
    if (!dequal(lastState.current, v)) {
      lastState.current = v;
      setState(v);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (editor) {
        setStateSafe(selector(editor));
      }
    }, debounceTimeMs);
    return () => {
      clearTimeout(timeout);
    };
  }, [debounceTimeMs, editor, selector, setStateSafe]);

  const selectorRef = useRef(selector);
  selectorRef.current = selector;
  useEffect(() => {
    const subscriber = debounce(() => {
      if (!editor) {
        return;
      }
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

export function useEditorChange<T>(
  selector: (editor: MyEditor) => T,
  options?: UseEditorChangeOptions
): T {
  return useExternalEditorChange<T>(useTEditorRef(), selector, options) as T;
}

export function useEditorChangePromise<T>(
  selector: (editor: PlateEditor<MyValue>) => Promise<T>,
  { debounceTimeMs = 100 }: UseEditorChangeOptions = {}
): T | undefined {
  const editor = useTEditorRef();
  const editorChanges = useContext(EditorChangeContext);
  const [state, setState] = useState<T | undefined>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (editor) {
        selector(editor).then(setState);
      }
    }, debounceTimeMs);
    return () => {
      clearTimeout(timeout);
    };
  }, [debounceTimeMs, editor, selector]);

  useEffect(() => {
    const sub = editorChanges
      .pipe(
        debounceTime(debounceTimeMs),
        concatMap(() => selector(editor)),
        distinctUntilChanged((a, b) => dequal(a, b))
      )
      .subscribe(setState);

    return () => {
      sub.unsubscribe();
    };
  }, [debounceTimeMs, editor, editorChanges, selector]);

  return state;
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
