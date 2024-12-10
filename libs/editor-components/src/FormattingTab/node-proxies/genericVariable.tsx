import { ELEMENT_VARIABLE_DEF } from '@decipad/editor-types';
import { createMultipleNodeProxyFactory, ifVaries } from '../proxy';
import { mapVariableProperties, variableActions } from './utils';
import { VariableForm } from './VariableForm';
import { ProxyFactoryConfig, ProxyFormProps } from './types';
import { ProxyStringField } from '../proxy-fields';
import { FC } from 'react';

export const genericVariableConfig = {
  key: 'genericVariable' as const,
  match: { type: ELEMENT_VARIABLE_DEF },
  factory: createMultipleNodeProxyFactory({
    mapProperties: mapVariableProperties,
    actions: variableActions,
  }),
} satisfies ProxyFactoryConfig<any, any>;

export const GenericVariableForm: FC<
  ProxyFormProps<typeof genericVariableConfig>
> = ({ editor, proxy }) => {
  const { properties, actions } = proxy;
  const propertyValue = ifVaries(properties.variant, undefined);
  return (
    <VariableForm editor={editor} proxy={proxy}>
      {propertyValue !== 'toggle' && (
        <ProxyStringField
          editor={editor}
          label="Value"
          property={properties.value}
          onChange={actions.setValue}
        />
      )}
    </VariableForm>
  );
};
