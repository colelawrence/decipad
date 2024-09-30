import {
  ELEMENT_DISPLAY,
  DisplayElement,
  MyEditor,
  ResultFormatting,
} from '@decipad/editor-types';
import { createMultipleNodeProxyFactory, withDefault } from '../proxy';
import { setNodeProperty } from './utils';
import { ProxyFactoryConfig, ProxyFormProps } from './types';
import { FC } from 'react';
import { ProxyFormWrapper } from './ProxyFormWrapper';
import {
  ProxyDropdownField,
  ProxyColorDropdownField,
  ColorSwatchOrAuto,
} from '../proxy-fields';
import { capitalize } from 'lodash';

export const resultConfig = {
  key: 'result' as const,
  match: { type: ELEMENT_DISPLAY },
  factory: createMultipleNodeProxyFactory({
    mapProperties: (node: DisplayElement) => ({
      formatting: node.formatting,
      color: (node.color ?? 'auto') as ColorSwatchOrAuto,
    }),
    actions: {
      setFormatting: (node, editor: MyEditor, formatting: ResultFormatting) =>
        setNodeProperty(editor, node, 'formatting', formatting),
      setColor: (
        node: DisplayElement,
        editor: MyEditor,
        color: ColorSwatchOrAuto
      ) =>
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
  <ProxyFormWrapper>
    <ProxyDropdownField<ResultFormatting>
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
  </ProxyFormWrapper>
);
