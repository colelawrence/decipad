/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { Meta, StoryFn } from '@storybook/react';
import { p14Regular, p16Regular } from '../../../primitives';
import { Label } from './Label';

const args = {
  text: 'Label Text',
};

export default {
  title: 'Atoms / Editor / Charts / Label',
  component: Label,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = ({ text }: typeof args) => (
  <Label
    renderContent={(id) => (
      <input
        id={id}
        css={css(p16Regular)}
        readOnly
        value="Label target (e.g. input field)"
      />
    )}
  >
    <span css={css(p14Regular)}>{text}</span>
  </Label>
);
