import { css } from '@emotion/react';
import { Meta, Story } from '@storybook/react';
import { p14Regular, p16Regular } from '../../primitives';
import { Label } from './Label';

const args = {
  text: 'Label Text',
};

export default {
  title: 'Atoms / Editor / Charts / Label',
  component: Label,
  args,
} as Meta;

export const Normal: Story<typeof args> = ({ text }) => (
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
