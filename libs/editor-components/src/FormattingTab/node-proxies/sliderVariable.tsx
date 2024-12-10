import {
  ELEMENT_VARIABLE_DEF,
  MyEditor,
  VariableSliderElement,
} from '@decipad/editor-types';
import { createMultipleNodeProxyFactory } from '../proxy';
import {
  mapVariableProperties,
  variableActions,
  setNodeProperty,
  normalizeRationalNumber,
  normalizeNonNegativeNumber,
} from './utils';
import { validateSliders } from './validateSliders';
import { FC, useMemo } from 'react';
import { ProxyFactoryConfig, ProxyFormProps } from './types';
import { VariableForm } from './VariableForm';
import { InputFieldHorizontal, InputFieldHorizontalGroup } from '@decipad/ui';
import { ProxyStringField } from '../proxy-fields';

export const sliderVariableConfig = {
  key: 'sliderVariable' as const,
  match: { type: ELEMENT_VARIABLE_DEF, variant: 'slider' },
  factory: createMultipleNodeProxyFactory({
    mapProperties: (node: VariableSliderElement) => {
      const [, , slider] = node.children;
      return {
        ...mapVariableProperties(node),
        max: slider.max,
        min: slider.min,
        step: slider.step,
      };
    },
    actions: {
      ...variableActions,
      setMax: (node, editor: MyEditor, max: string) =>
        setNodeProperty(editor, node.children[2], 'max', max),
      setMin: (node, editor: MyEditor, min: string) =>
        setNodeProperty(editor, node.children[2], 'min', min),
      setStep: (node, editor: MyEditor, step: string) =>
        setNodeProperty(editor, node.children[2], 'step', step),
    },
  }),
} satisfies ProxyFactoryConfig<any, any>;

export const SliderVariableForm: FC<
  ProxyFormProps<typeof sliderVariableConfig>
> = ({ editor, proxy }) => {
  const { properties, actions, nodes } = proxy;

  const validationErrors = useMemo(
    () =>
      validateSliders(
        nodes.map((variableSlider) => {
          const slider = variableSlider.children[2];
          return {
            min: Number(slider.min),
            max: Number(slider.max),
            step: Number(slider.step),
          };
        })
      ),
    [nodes]
  );

  return (
    <VariableForm editor={editor} proxy={proxy}>
      <ProxyStringField
        editor={editor}
        label="Value"
        property={properties.value}
        onChange={actions.setValue}
      />

      <InputFieldHorizontalGroup>
        <ProxyStringField
          editor={editor}
          as={InputFieldHorizontal}
          label="Minimum value"
          property={properties.min}
          onChange={actions.setMin}
          normalizeValue={normalizeRationalNumber}
          error={validationErrors.min}
        />

        <ProxyStringField
          editor={editor}
          as={InputFieldHorizontal}
          label="Maximum value"
          property={properties.max}
          onChange={actions.setMax}
          normalizeValue={normalizeRationalNumber}
          error={validationErrors.max}
        />

        <ProxyStringField
          editor={editor}
          as={InputFieldHorizontal}
          label="Step size"
          property={properties.step}
          onChange={actions.setStep}
          normalizeValue={normalizeNonNegativeNumber}
          error={validationErrors.step}
        />
      </InputFieldHorizontalGroup>
    </VariableForm>
  );
};
