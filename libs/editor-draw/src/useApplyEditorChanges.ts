import {
  DrawElement,
  DrawElementDescendant,
  DrawElements,
} from '@decipad/editor-types';
import { useEditorChangeCallback } from '@decipad/editor-hooks';
import { findNodePath, getNode } from '@udecode/plate';
import { cloneDeep, extend } from 'lodash';
import { useCallback, useRef } from 'react';
import { DrawElementsDiff } from './types';
import { findElementsDiff } from './findElementsDiff';

type UpdateScene = (elements: Readonly<DrawElements>) => void;

export const useApplyEditorChanges = (
  element: DrawElement,
  updateScene: UpdateScene
) => {
  const previousEditorElements = useRef(
    element.children as Readonly<DrawElementDescendant[]>
  );

  const applyElementsDiffToDrawing = useCallback(
    (diff: DrawElementsDiff) => {
      const newScene = cloneDeep(
        previousEditorElements.current
      ) as DrawElementDescendant[];
      for (const a of diff.added) {
        newScene.push(a);
      }
      for (const m of diff.modified) {
        const el = newScene.find((e) => e.id === m.id);
        if (el) {
          extend(el, m);
        }
      }
      updateScene(newScene.filter((el) => !diff.removed.includes(el.id)));
    },
    [updateScene]
  );

  useEditorChangeCallback(
    (editor): DrawElement | undefined => {
      // refetch the element
      const path = findNodePath(editor, element);
      if (path) {
        return getNode<DrawElement>(editor, path) ?? undefined;
      }
      return undefined;
    },
    useCallback(
      (draw?: DrawElement) => {
        if (draw) {
          const diff = findElementsDiff(
            previousEditorElements.current,
            draw.children
          );
          applyElementsDiffToDrawing(diff);
          previousEditorElements.current = draw.children;
        }
      },
      [applyElementsDiffToDrawing]
    )
  );
};
