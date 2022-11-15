import {
  DrawElement,
  DrawElements,
  ELEMENT_DRAW,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useEditorChange, useIsEditorReadOnly } from '@decipad/react-contexts';
import { Draw as UIDraw } from '@decipad/ui';
import { findNodePath, getNode } from '@udecode/plate';
import { dequal } from 'dequal';
import { cloneDeep } from 'lodash';
import { MutableRefObject, useCallback, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { DraggableBlock } from '../block-management';
import { applyElementsDiff } from './applyElementsDiff';
import { fixElements, unfixElements } from './fixElement';
import {
  ExcalidrawRef,
  ExcalidrawImperativeAPI,
  ExcalidrawDrawElement,
} from './types';

const DEBOUNCE_SAVE_SKETCH_MS = 500;
const DEBOUNCE_EDITOR_CHANGE_MS = 1_000;

export const Draw: PlateComponent = ({ element, attributes }) => {
  assertElementType(element, ELEMENT_DRAW);

  const editor = useTEditorRef();
  const readOnly = useIsEditorReadOnly();
  const [isInteracting, setIsInteracting] = useState(false);
  const elementRef = useRef(element);
  elementRef.current = element;
  const updating = useRef(false);
  const needsUpdate = useRef(false);

  const previousElements = useRef<DrawElements>(
    unfixElements(cloneDeep(element.children))
  );
  const nextElements = useRef<Readonly<DrawElements> | undefined>();

  const updateScene = useCallback(() => {
    const excalidrawApi = excalidrawRef.current;
    if (
      excalidrawApi &&
      nextElements.current &&
      !dequal(previousElements.current, nextElements.current)
    ) {
      const api = excalidrawApi as ExcalidrawImperativeAPI;
      const elements = cloneDeep(unfixElements(nextElements.current));
      api.updateScene({ elements });
      previousElements.current = elements;
    }
  }, []);

  const onDebouncedChange = useDebouncedCallback(
    useCallback(
      (newElements: Readonly<ExcalidrawDrawElement[]>) => {
        updating.current = false;
        const path = findNodePath(editor, element);
        if (path) {
          const elements = cloneDeep(fixElements(newElements));
          nextElements.current = elements;
          applyElementsDiff(
            editor,
            [element, path],
            elementRef.current.children,
            elements
          );
        }
        if (needsUpdate.current && !isInteracting) {
          needsUpdate.current = false;
          nextElements.current = cloneDeep(elementRef.current.children);
          updateScene();
        }
      },
      [editor, element, isInteracting, updateScene]
    ),
    DEBOUNCE_SAVE_SKETCH_MS
  );

  const lastValue = useRef<Readonly<ExcalidrawDrawElement[]> | undefined>();

  const onChange = useCallback(
    (newElements: Readonly<ExcalidrawDrawElement[]>) => {
      if (!dequal(lastValue.current, newElements)) {
        updating.current = true;
        lastValue.current = cloneDeep(newElements);
        onDebouncedChange(newElements);
      }
    },
    [onDebouncedChange]
  );

  const excalidrawRef: ExcalidrawRef | MutableRefObject<undefined> = useRef();

  useEditorChange(
    useDebouncedCallback(
      useCallback(
        (draw?: DrawElement) => {
          // if (!isInteracting) {
          if (draw) {
            if (updating.current) {
              needsUpdate.current = true;
            } else {
              nextElements.current = cloneDeep(draw.children);
              updateScene();
            }
          }
          // }
        },
        [updateScene]
      ),
      DEBOUNCE_EDITOR_CHANGE_MS
    ),
    (): DrawElement | undefined => {
      // refetch the element
      const path = findNodePath(editor, element);
      if (path) {
        return getNode<DrawElement>(editor, path) ?? undefined;
      }
      return undefined;
    }
  );

  return (
    <UIDraw
      excalidrawRef={excalidrawRef}
      draggableBlock={DraggableBlock}
      readOnly={readOnly}
      elements={cloneDeep(previousElements.current)}
      onChange={onChange}
      onInteractingChange={setIsInteracting}
      element={element}
      attributes={attributes}
      editor={editor}
    />
  );
};
