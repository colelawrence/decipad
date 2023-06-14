/* eslint decipad/css-prop-named-variable: 0 */
import { Meta, StoryFn } from '@storybook/react';
import { LiveCode } from './LiveCode';

export default {
  title: 'Atoms / Editor / LiveCode',
  component: LiveCode,
} as Meta;

export const Normal: StoryFn = () => (
  <LiveCode timeOfLastRun={null}>
    <span>Live Code</span>
  </LiveCode>
);
