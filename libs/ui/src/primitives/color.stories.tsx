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
  grey250: 'Grey 250',
  grey270: 'Grey 270',
  grey300: 'Grey 300',
  grey400: 'Grey 400',
  offWhite: 'Off-White',

  electricGreen100: 'Electric Green 100',
  electricGreen200: 'Electric Green 200',
  electricGreen500: 'Electric Green 500',

  red100: 'Red 100',
  red200: 'Red 200',
  red300: 'Red 300',
  red400: 'Red 400',
  red500: 'Red 500',
  red600: 'Red 600',

  orange100: 'Orange 100',
  orange200: 'Orange 200',
  orange300: 'Orange 300',
  orange400: 'Orange 400',
  orange500: 'Orange 500',
  orange600: 'Orange 600',

  purple300: 'Purple 300',

  blockquote: 'Blockquote',
  codeBubbleBackground: 'Code Bubble Background',
  codeBubbleText: 'Code Bubble Text',
  codeErrorIconFill: 'Code Error Icon Fill',

  logoSecondColor: 'Logo Second Color',
  logoThirdColor: 'Logo Third Color',
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
