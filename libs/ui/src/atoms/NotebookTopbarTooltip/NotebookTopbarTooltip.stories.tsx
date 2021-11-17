import { css } from '@emotion/react';
import { Meta, Story } from '@storybook/react';
import { p16Regular } from '../../primitives';
import { NotebookTopbarTooltip } from './NotebookTopbarTooltip';

export default {
  title: 'Atoms / Notebook / Topbar Tooltip',
  component: NotebookTopbarTooltip,
} as Meta;

export const Normal: Story = () => (
  <NotebookTopbarTooltip name="John Doe" permission="Admin">
    <span css={css(p16Regular)}>Hover me!</span>
  </NotebookTopbarTooltip>
);
