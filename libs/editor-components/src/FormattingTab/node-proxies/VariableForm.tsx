import { FC, ReactNode } from 'react';
import { ProxyFormProps } from './types';
import { ProxyFormWrapper } from './ProxyFormWrapper';
import {
  ProxyStringField,
  ProxyDropdownField,
  ProxyColorDropdownField,
} from '../proxy-fields';
import { genericVariableConfig } from './genericVariable';

export const VariableForm: FC<
  ProxyFormProps<typeof genericVariableConfig> & { children?: ReactNode }
> = ({ editor, proxy: { properties, actions, nodes }, children }) => (
  <ProxyFormWrapper>
    <ProxyStringField
      editor={editor}
      label="Variable name"
      property={properties.name}
      onChange={actions.setName}
      disabled={nodes.length > 1}
    />

    <ProxyDropdownField
      editor={editor}
      label="Visualization"
      property={properties.variant}
      onChange={actions.setVariant}
      options={['expression', 'toggle', 'date', 'slider', 'dropdown']}
      labelForValue={(variant) =>
        ({
          expression: 'Input widget',
          toggle: 'Toggle widget',
          date: 'Date widget',
          slider: 'Slider widget',
          dropdown: 'Dropdown widget',
        }[variant])
      }
    />

    {children}

    <ProxyColorDropdownField
      editor={editor}
      label="Variable color"
      property={properties.color}
      onChange={actions.setColor}
    />
  </ProxyFormWrapper>
);
