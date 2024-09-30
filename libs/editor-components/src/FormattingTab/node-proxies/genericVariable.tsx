import { ELEMENT_VARIABLE_DEF } from '@decipad/editor-types';
import { createMultipleNodeProxyFactory } from '../proxy';
import { mapVariableProperties, variableActions } from './utils';
import { VariableForm } from './VariableForm';
import { ProxyFactoryConfig } from './types';

export const genericVariableConfig = {
  key: 'genericVariable' as const,
  match: { type: ELEMENT_VARIABLE_DEF },
  factory: createMultipleNodeProxyFactory({
    mapProperties: mapVariableProperties,
    actions: variableActions,
  }),
} satisfies ProxyFactoryConfig<any, any>;

export const GenericVariableForm = VariableForm;
