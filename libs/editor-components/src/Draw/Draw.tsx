import type {
  DrawElement,
  DrawElements,
  PlateComponent,
} from '@decipad/editor-types';
import { ELEMENT_DRAW, useMyEditorRef } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { Draw as UIDraw } from '../plate-ui/draw';
import cloneDeep from 'lodash/cloneDeep';
import type { MutableRefObject } from 'react';
import { useCallback, useRef, useState } from 'react';
import type { ExcalidrawRef as TExcalidrawRef } from '@decipad/editor-components';
import { DraggableBlock } from '../block-management';
import { dequal } from '@decipad/utils';
import { unfixElements } from './fixElement';
import type { ExcalidrawImperativeAPI, ExcalidrawRef } from './types';
import { useApplyEditorChanges } from './useApplyEditorChanges';
import { useApplyUserChanges } from './useApplyUserChanges';

export const Draw: PlateComponent = ({ element, attributes, className }) => {
  assertElementType(element, ELEMENT_DRAW);

  const editor = useMyEditorRef();
  const readOnly = useIsEditorReadOnly();
  const [isInteracting, setIsInteracting] = useState(false);
  const elementRef = useRef(element);
  elementRef.current = element;
  const updating = useRef(false);

  const previousElements = useRef<DrawElements>(
    cloneDeep(element.children) as DrawElements
  );

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
    element: element as DrawElement,
    updating,
    isInteracting,
    updateScene,
  });

  useApplyEditorChanges(element as DrawElement, updateScene);

  return (
    <UIDraw
      className={className}
      excalidrawRef={excalidrawRef as TExcalidrawRef}
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
