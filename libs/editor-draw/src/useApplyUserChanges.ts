/* eslint-disable no-param-reassign */
import { findNodePath } from '@udecode/plate';
import cloneDeep from 'lodash.clonedeep';
import { MutableRefObject, useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { DrawElement, MyEditor, DrawElements } from '@decipad/editor-types';
import { applyElementsDiffToEditor } from './applyElementsDiffToEditor';
import { fixElements } from './fixElement';
import { ExcalidrawDrawElement } from './types';
import { findElementsDiff } from './findElementsDiff';

type UpdateScene = (elements: Readonly<DrawElements>) => void;

interface ApplyUserChangesProps {
  editor: MyEditor;
  element: DrawElement;
  updating: MutableRefObject<boolean>;
  updateScene: UpdateScene;
  isInteracting: boolean;
}

interface ApplyUserChangesReturn {
  onUserChange: (newElements: Readonly<ExcalidrawDrawElement[]>) => void;
}

const DEBOUNCE_SAVE_SKETCH_MS = 500;

export const useApplyUserChanges = ({
  editor,
  element,
  updateScene,
  updating,
  isInteracting,
}: ApplyUserChangesProps): ApplyUserChangesReturn => {
  const elementRef = useRef(element);
  elementRef.current = element;
  const needsUpdate = useRef(false);

  const onDebouncedUserChange = useDebouncedCallback(
    useCallback(
      (newElements: Readonly<ExcalidrawDrawElement[]>) => {
        updating.current = false;
        const path = findNodePath(editor, element);
        if (path) {
          const elements = fixElements(newElements);
          const diff = findElementsDiff(elementRef.current.children, elements);
          applyElementsDiffToEditor(editor, [element, path], diff);
          const nextElements = cloneDeep(elements);
          if (needsUpdate.current && !isInteracting) {
            needsUpdate.current = false;
            updateScene(nextElements);
          }
        }
      },
      [editor, element, isInteracting, needsUpdate, updateScene, updating]
    ),
    DEBOUNCE_SAVE_SKETCH_MS
  );

  const lastUserValue = useRef<Readonly<ExcalidrawDrawElement[]> | undefined>();

  const onUserChange = useCallback(
    (newElements: Readonly<ExcalidrawDrawElement[]>) => {
      updating.current = true;
      lastUserValue.current = cloneDeep(newElements);
      onDebouncedUserChange(newElements);
    },
    [onDebouncedUserChange, updating]
  );

  return { onUserChange };
};
