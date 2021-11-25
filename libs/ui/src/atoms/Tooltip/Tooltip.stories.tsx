import { css } from '@emotion/react';
import { Meta, Story } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { p14Regular } from '../../primitives';

const args = {
  children: 'John Doe',
  triggerText: 'Hover me',
};

export default {
  title: 'Atoms / Tooltip',
  component: Tooltip,
  args,
} as Meta;

export const Normal: Story<typeof args> = ({ children, triggerText }) => (
  <Tooltip button={<button css={css(p14Regular)}>{triggerText}</button>}>
    {children}
  </Tooltip>
);
