import { Meta, Story } from '@storybook/react';
import * as colors from './color';
import { OpaqueColor } from './color';

type ColorId = Exclude<
  keyof typeof import('./color'),
  'color' | 'transparency'
>;
const colorNames: Record<ColorId, string> = {
  black: 'Black',
  white: 'White',
  grey100: 'Grey 100',
  grey200: 'Grey 200',
  grey300: 'Grey 300',
  grey400: 'Grey 400',
  offWhite: 'Off-White',

  purple100: 'Purple 100',
  electricGreen100: 'Electric Green 100',
  electricGreen200: 'Electric Green 200',

  blockquote: 'Blockquote',
};
export default {
  title: 'Primitives / Color',
  argTypes: {
    color: {
      control: { type: 'select', labels: colorNames },
      options: Object.keys(colorNames),
      mapping: colors,
      defaultValue: 'white',
    },
  },
} as Meta;

export const Normal: Story<{ color: OpaqueColor }> = ({ color }) => (
  <div
    role="presentation"
    css={{
      width: '100%',
      height: '100%',
      backgroundColor: color.rgb,
    }}
  />
);
