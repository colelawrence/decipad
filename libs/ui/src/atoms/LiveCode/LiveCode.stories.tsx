/* eslint decipad/css-prop-named-variable: 0 */
import { Meta, Story } from '@storybook/react';
import { LiveCode } from './LiveCode';

export default {
  title: 'Atoms / Editor / LiveCode',
  component: LiveCode,
} as Meta;

export const Normal: Story = () => (
  <LiveCode>
    <span>Live Code</span>
  </LiveCode>
);
