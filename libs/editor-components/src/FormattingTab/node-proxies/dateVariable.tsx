import {
  ELEMENT_VARIABLE_DEF,
  VariableSliderElement,
} from '@decipad/editor-types';
import { createMultipleNodeProxyFactory } from '../proxy';
import { mapVariableProperties, variableActions } from './utils';
import { FC } from 'react';
import { ProxyFactoryConfig, ProxyFormProps } from './types';
import { VariableForm } from './VariableForm';
import { ProxyDateField } from '../proxy-fields';

export const dateVariableConfig = {
  key: 'dateVariable' as const,
  match: { type: ELEMENT_VARIABLE_DEF, variant: 'date' },
  factory: createMultipleNodeProxyFactory({
    mapProperties: (node: VariableSliderElement) => {
      return mapVariableProperties(node);
    },
    actions: variableActions,
  }),
} satisfies ProxyFactoryConfig<any, any>;

export const DateVariableForm: FC<
  ProxyFormProps<typeof dateVariableConfig>
> = ({ editor, proxy }) => {
  const { properties, actions } = proxy;

  return (
    <VariableForm editor={editor} proxy={proxy}>
      <ProxyDateField
        editor={editor}
        label="Value"
        property={properties.value}
        onChange={actions.setValue}
      />
    </VariableForm>
  );
};
