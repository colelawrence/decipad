import { ClientEventsContext } from '@decipad/client-events';
import type {
  ExpressionElement,
  PlateComponent,
  SliderElement,
} from '@decipad/editor-types';
import {
  ELEMENT_EXPRESSION,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
  useMyEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  isElementOfType,
  mutateText,
} from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { Slider as UISlider } from '@decipad/ui';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useVariableEditorContext } from './VariableEditorContext';
import assert from 'assert';
import { parseNumberWithUnit } from '@decipad/computer';
import { findNodePath, getNodeString } from '@udecode/plate-common';
import { useParentNode } from '@decipad/editor-hooks';

/**
 * Grabs the expression element from a slider.
 * Taking into account that it could be part of a column element.
 */
function useSliderParentExpression(
  element: SliderElement
): ExpressionElement | undefined {
  const parent = useParentNode(element);
  return useMemo(() => {
    if (
      !parent ||
      !isElementOfType(parent, ELEMENT_VARIABLE_DEF) ||
      parent.variant !== 'slider'
    ) {
      return;
    }
    const expressionElement = parent.children[1];
    if (!isElementOfType(expressionElement, ELEMENT_EXPRESSION)) {
      return;
    }

    return expressionElement;
  }, [parent]);
}

/**
 * Returns a tuple with the current sliders value,
 * and a function for when the slider changes (by the user dragging the slider)
 */
function useOnSliderChange(
  element: SliderElement
): [number, (newValue: number) => void, (toggleSync: boolean) => void] {
  const editor = useMyEditorRef();
  const path = findNodePath(editor, element);
  assert(path != null, 'path must always be defined');

  const expression = useSliderParentExpression(element);

  // We keep an extra state, just so the feedback to the user
  // from dragging the slider is instant.
  const [sliderValue, setSliderValue] = useState(0);
  const [syncValues, setSyncValues] = useState(true);

  useEffect(() => {
    if (!syncValues || !expression) return;
    const [value] = parseNumberWithUnit(getNodeString(expression)) ?? [];

    if (sliderValue !== value) {
      setSliderValue(value ?? 0);
    }
  }, [editor, path, sliderValue, syncValues, element, expression]);

  const onChange = useCallback(
    (newValue: number) => {
      if (!path || !expression) return;

      // The path of the expression is 1.
      // It goes: Caption -> Expression -> Slider.
      const expressionPath = [...path];
      expressionPath[expressionPath.length - 1] = 1;

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
      segmentEvent: {
        type: 'action',
        action: 'widget value updated',
        props: {
          variant: 'slider',
          isReadOnly,
        },
      },
      gaEvent: {
        category: 'widget',
        action: 'widget value updated',
        label: 'slider',
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
