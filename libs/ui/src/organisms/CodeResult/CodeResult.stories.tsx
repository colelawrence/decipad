import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { withCode } from '../../storybook-utils';
import { CodeResult } from './CodeResult';

export default {
  title: 'Organisms / Editor / Results',
  component: CodeResult,
  decorators: [withCode('["Lorem", "Ipsum", "Dolor", "Sit", "Amet"]')],
} as Meta;

export const Inline: Story<ComponentProps<typeof CodeResult>> = (props) => (
  <CodeResult {...props} variant="inline" />
);

export const Block: Story<ComponentProps<typeof CodeResult>> = (props) => (
  <CodeResult {...props} variant="block" />
);
