import {
  DrawElements,
  ELEMENT_DRAW,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { Draw as UIDraw } from '@decipad/ui/src/organisms/Draw/Draw';
import { cloneDeep } from 'lodash';
import { MutableRefObject, useCallback, useRef, useState } from 'react';
import { DraggableBlock } from '@decipad/editor-components';
import { dequal } from '@decipad/utils';
import { unfixElements } from './fixElement';
import { ExcalidrawRef, ExcalidrawImperativeAPI } from './types';
import { useApplyEditorChanges } from './useApplyEditorChanges';
import { useApplyUserChanges } from './useApplyUserChanges';

export const Draw: PlateComponent = ({ element, attributes }) => {
  assertElementType(element, ELEMENT_DRAW);

  const editor = useTEditorRef();
  const readOnly = useIsEditorReadOnly();
  const [isInteracting, setIsInteracting] = useState(false);
  const elementRef = useRef(element);
  elementRef.current = element;
  const updating = useRef(false);

  const previousElements = useRef<DrawElements>(cloneDeep(element.children));

  const updateScene = useCallback((nextElements: Readonly<DrawElements>) => {
    const excalidrawApi = excalidrawRef.current;
    if (excalidrawApi && !dequal(previousElements.current, nextElements)) {
      const api = excalidrawApi as ExcalidrawImperativeAPI;
      api.updateScene({
        elements: unfixElements(cloneDeep(nextElements)),
      });
      previousElements.current = cloneDeep(
        nextElements
      ) as typeof previousElements.current;
    }
  }, []);

  const excalidrawRef: ExcalidrawRef | MutableRefObject<undefined> = useRef();

  const { onUserChange } = useApplyUserChanges({
    editor,
    element,
    updating,
    isInteracting,
    updateScene,
  });

  useApplyEditorChanges(element, updateScene);

  return (
    <UIDraw
      excalidrawRef={excalidrawRef}
      draggableBlock={DraggableBlock}
      readOnly={readOnly}
      elements={cloneDeep(previousElements.current)}
      onChange={onUserChange}
      onInteractingChange={setIsInteracting}
      element={element}
      attributes={attributes}
      editor={editor}
    />
  );
};
