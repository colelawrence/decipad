import type {
  ExpressionElement,
  MyEditor,
  SliderElement,
} from '@decipad/editor-types';
import { ELEMENT_EXPRESSION, useMyEditorRef } from '@decipad/editor-types';
import { mutateText } from '@decipad/editor-utils';
import { useCallback, useEffect, useState } from 'react';
import { parseNumberWithUnit } from '@decipad/computer';
import {
  findNodePath,
  getNode,
  getNodeString,
  isElement,
} from '@udecode/plate-common';
import { Path } from 'slate';

function getExpressionPathFromSliderPath(path: Path): Path {
  // The path of the expression is 1.
  // It goes: Caption -> Expression -> Slider.

  const expressionPath = [...path];
  expressionPath[expressionPath.length - 1] = 1;

  return expressionPath;
}

function getSliderParentExpression(
  editor: MyEditor,
  sliderExpressionPath: Path
): ExpressionElement | undefined {
  const expressionPath = getExpressionPathFromSliderPath(sliderExpressionPath);

  const n = getNode(editor, expressionPath);

  if (!isElement(n)) {
    return undefined;
  }

  if (n.type !== ELEMENT_EXPRESSION) {
    return undefined;
  }

  return n;
}

/**
 * Returns a tuple with the current sliders value,
 * and a function for when the slider changes (by the user dragging the slider)
 */
export function useOnSliderChange(
  element: SliderElement
): [number, (newValue: number) => void, (toggleSync: boolean) => void] {
  const editor = useMyEditorRef();
  const path = findNodePath(editor, element);

  // We keep an extra state, just so the feedback to the user
  // from dragging the slider is instant.
  const [sliderValue, setSliderValue] = useState(0);
  const [syncValues, setSyncValues] = useState(true);

  useEffect(() => {
    if (!syncValues || !path) return;

    const expression = getSliderParentExpression(editor, path);
    if (!expression) return;

    const [value] = parseNumberWithUnit(getNodeString(expression)) ?? [];

    if (sliderValue !== value) {
      setSliderValue(value ?? 0);
    }
  }, [editor, path, sliderValue, syncValues, element]);

  const onChange = useCallback(
    (newValue: number) => {
      if (!path) return;

      const expression = getSliderParentExpression(editor, path);
      if (!expression) return;

      const expressionValue = getNodeString(expression);

      const values = parseNumberWithUnit(
        expressionValue.length === 0 ? '0' : expressionValue
      );

      if (values == null) {
        console.error('Slider could not parse value with unit');
        return;
      }

      const [value, rest, prefix] = values;

      if (newValue === value) {
        return;
      }

      setSliderValue(newValue);

      mutateText(
        editor,
        getExpressionPathFromSliderPath(path)
      )(`${prefix}${newValue}${rest ?? expression ?? ''}`);
    },
    [editor, path]
  );

  return [sliderValue, onChange, setSyncValues];
}
