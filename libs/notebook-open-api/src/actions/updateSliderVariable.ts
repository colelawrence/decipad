import {
  isElement,
  findNode,
  withoutNormalizing,
  setNodes,
  TNodeEntry,
} from '@udecode/plate-common';
import {
  ELEMENT_VARIABLE_DEF,
  type AnyElement,
  SliderElement,
} from '@decipad/editor-types';
import {
  parseSimpleValue,
  simpleValueToString,
} from '@decipad/remote-computer';
import { Action, ActionParams } from './types';
import { getNodeString } from '../utils/getNodeString';
import { notFound, notAcceptable } from '@hapi/boom';
import { matchElementId } from '../utils/matchElementId';
import { replaceText } from './utils/replaceText';
import { findElementByVariableName } from './utils/findElementByVariableName';

export const updateSliderVariable: Action<'updateSliderVariable'> = {
  summary: 'changes a slider component',
  description: 'changes an existing slider component.',
  parameters: {
    elementId: {
      description: 'the id of the slider element to change. mandatory.',
      required: true,
      schema: {
        type: 'string',
      },
    },
    variableName: {
      description:
        'the new name of the variable for this slider. Should be unique and have no spaces or weird characters.',
      required: false,
      schema: {
        type: 'string',
      },
    },
    value: {
      description: 'the new value for this slider',
      required: false,
      schema: {
        type: 'number',
      },
    },
    unit: {
      description: 'the new unit of the value',
      required: false,
      schema: {
        type: 'string',
      },
    },
    min: {
      description: 'the new minimum value this slider accepts',
      required: false,
      schema: {
        type: 'number',
      },
    },
    max: {
      description: 'the new maximum value this slider accepts',
      required: false,
      schema: {
        type: 'number',
      },
    },
    step: {
      description: 'the new step at which the user can change the value',
      required: false,
      schema: {
        type: 'number',
      },
    },
  },
  returnsActionResultWithNotebookError: true,
  requiresNotebook: true,
  validateParams: (_params): _params is ActionParams<'updateSliderVariable'> =>
    true,
  handler: (
    editor,
    { elementId, variableName, min, max, value, step, unit }
  ) => {
    let entry: TNodeEntry<AnyElement> | undefined;
    if (elementId) {
      entry = findNode<AnyElement>(editor, {
        match: matchElementId(elementId),
        block: true,
      });
    } else if (variableName) {
      // we try to match by variable name
      entry = findElementByVariableName(editor, variableName);
    }
    if (!entry || !isElement(entry[0])) {
      if (elementId) {
        throw notFound(`Could not find slider with id ${elementId}`);
      } else if (variableName) {
        throw notFound(
          `Could not find slider for variable name ${variableName}`
        );
      } else {
        throw notAcceptable('You need to pass an element id');
      }
    }
    const [slider, sliderPath] = entry;
    if (slider.type !== ELEMENT_VARIABLE_DEF || slider.variant !== 'slider') {
      throw notAcceptable(`element with id ${elementId} is not a slider`);
    }

    withoutNormalizing(editor, () => {
      const sliderExpressionPath = [...sliderPath, 1];

      // update caption
      if (variableName != null) {
        const captionPath = [...sliderPath, 0];
        const captionElement = slider.children[0];
        replaceText(editor, [captionElement, captionPath], variableName);
      }

      // update expression element
      {
        const expressionElement = slider.children[1];
        const expressionText = getNodeString(expressionElement);
        const simpleValue =
          parseSimpleValue(expressionText) ??
          ({} as NonNullable<ReturnType<typeof parseSimpleValue>>);
        const newSimpleValue = {
          ...simpleValue,
        };
        if (value != null) {
          const parsedValue = parseSimpleValue(value.toString());
          if (parsedValue?.ast) {
            newSimpleValue.ast = parsedValue.ast;
          }
        }
        if (unit != null) {
          const parsedValue = parseSimpleValue(unit);
          if (parsedValue?.unit) {
            newSimpleValue.unit = parsedValue.unit;
          }
        }
        const newText = simpleValueToString(newSimpleValue);
        if (newText) {
          replaceText(
            editor,
            [expressionElement, sliderExpressionPath],
            newText
          );
        }
      }

      // update slider slider
      {
        const sliderSliderPath = [...sliderPath, 2];

        if (min != null) {
          setNodes<SliderElement>(
            editor,
            { min: min.toString() },
            { at: sliderSliderPath }
          );
        }
        if (max != null) {
          setNodes<SliderElement>(
            editor,
            { max: max.toString() },
            { at: sliderSliderPath }
          );
        }

        if (value != null) {
          setNodes<SliderElement>(
            editor,
            { value: value.toString() },
            { at: sliderSliderPath }
          );
        }

        if (step != null) {
          setNodes<SliderElement>(
            editor,
            { step: step.toString() },
            { at: sliderSliderPath }
          );
        }
      }
    });
  },
};
