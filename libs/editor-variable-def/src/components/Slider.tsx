import { ClientEventsContext } from '@decipad/client-events';
import {
  ELEMENT_COLUMNS,
  ELEMENT_EXPRESSION,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
  ExpressionElement,
  MyEditor,
  PlateComponent,
  SliderElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { useNodePath } from '@decipad/editor-hooks';
import { assertElementType, mutateText } from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { Slider as UISlider } from '@decipad/ui';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useVariableEditorContext } from './VariableEditorContext';
import assert from 'assert';
import { parseNumberWithUnit } from '@decipad/computer';
import { getNodeString } from '@udecode/plate-common';
import { Path } from 'slate';

/**
 * Grabs the expression element from a slider.
 * Taking into account that it could be part of a column element.
 */
function getParentExpression(editor: MyEditor, path: Path): ExpressionElement {
  let parent = editor.children[path[0]];
  if (parent.type === ELEMENT_COLUMNS) {
    parent = parent.children[path[1]];
  }

  assertElementType(parent, ELEMENT_VARIABLE_DEF);
  const [, expression] = parent.children;
  assertElementType(expression, ELEMENT_EXPRESSION);

  return expression;
}

/**
 * Returns a tuple with the current sliders value,
 * and a function for when the slider changes (by the user dragging the slider)
 */
function useOnSliderChange(
  element: SliderElement
): [number, (newValue: number) => void, (toggleSync: boolean) => void] {
  const editor = useTEditorRef();
  const path = useNodePath(element);
  assert(path != null, 'path must always be defined');

  const expression = getParentExpression(editor, path);

  // We keep an extra state, just so the feedback to the user
  // from dragging the slider is instant.
  const [sliderValue, setSliderValue] = useState(0);
  const [syncValues, setSyncValues] = useState(true);

  useEffect(() => {
    if (!syncValues) return;
    const [value] = parseNumberWithUnit(getNodeString(expression)) ?? [];

    if (sliderValue !== value) {
      setSliderValue(value ?? 0);
    }
  }, [editor, path, sliderValue, syncValues, element, expression]);

  const onChange = useCallback(
    (newValue: number) => {
      if (!path) return;

      // The path of the expression is 1.
      // It goes: Caption -> Expression -> Slider.
      const expressionPath = [...path];
      expressionPath[expressionPath.length - 1] = 1;

      const [value, rest, prefix] =
        parseNumberWithUnit(getNodeString(expression)) ?? [];

      if (newValue === value) {
        return;
      }

      setSliderValue(newValue);

      mutateText(
        editor,
        expressionPath
      )(`${prefix}${newValue}${rest ?? expression ?? ''}`);
    },
    [editor, expression, path]
  );

  return [sliderValue, onChange, setSyncValues];
}

export const Slider: PlateComponent = ({ attributes, element, children }) => {
  assertElementType(element, ELEMENT_SLIDER);
  const [value, onChange, setSyncValues] = useOnSliderChange(element);

  // Analytics
  const userEvents = useContext(ClientEventsContext);
  const isReadOnly = useIsEditorReadOnly();
  const onCommit = useCallback(() => {
    setSyncValues(true);
    userEvents({
      type: 'action',
      action: 'widget value updated',
      props: {
        variant: 'slider',
        isReadOnly,
      },
    });
  }, [isReadOnly, userEvents, setSyncValues]);

  const { color } = useVariableEditorContext();

  return (
    <div {...attributes} contentEditable={false}>
      {children}
      <UISlider
        {...element}
        min={Number(element.min)}
        max={Number(element.max)}
        step={Number(element.step)}
        onChange={(e) => {
          setSyncValues(false);
          onChange(e);
        }}
        value={value ?? 0}
        color={color}
        onCommit={onCommit}
      />
    </div>
  );
};
