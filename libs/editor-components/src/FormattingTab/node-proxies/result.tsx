import {
  ELEMENT_DISPLAY,
  DisplayElement,
  MyEditor,
  NumberFormatting,
} from '@decipad/editor-types';
import { createMultipleNodeProxyFactory, withDefault } from '../proxy';
import { setNodeProperty } from './utils';
import { ProxyFactoryConfig, ProxyFormProps } from './types';
import { FC } from 'react';
import { FormWrapper } from '../FormWrapper';
import {
  ProxyDropdownField,
  ProxyColorDropdownField,
  ColorOption,
} from '../proxy-fields';
import { capitalize } from 'lodash';

export const resultConfig = {
  key: 'result' as const,
  match: { type: ELEMENT_DISPLAY },
  factory: createMultipleNodeProxyFactory({
    mapProperties: (node: DisplayElement) => ({
      formatting: node.formatting,
      color: (node.color ?? 'auto') as ColorOption,
    }),
    actions: {
      setFormatting: (node, editor: MyEditor, formatting: NumberFormatting) =>
        setNodeProperty(editor, node, 'formatting', formatting),
      setColor: (node: DisplayElement, editor: MyEditor, color: ColorOption) =>
        setNodeProperty(
          editor,
          node,
          'color',
          color === 'auto' ? undefined : color
        ),
    },
  }),
} satisfies ProxyFactoryConfig<any, any>;

export const ResultForm: FC<ProxyFormProps<typeof resultConfig>> = ({
  editor,
  proxy: { properties, actions },
}) => (
  <FormWrapper>
    <ProxyDropdownField<NumberFormatting>
      editor={editor}
      label="Number format"
      property={withDefault(properties.formatting, 'automatic')}
      onChange={actions.setFormatting}
      options={['automatic', 'precise', 'financial', 'scientific']}
      labelForValue={capitalize}
    />

    <ProxyColorDropdownField
      editor={editor}
      label="Result color"
      property={properties.color}
      onChange={actions.setColor}
    />
  </FormWrapper>
);
