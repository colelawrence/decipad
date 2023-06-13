import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { withCode } from '../../storybook-utils';
import { RangeResult } from './RangeResult';

export default {
  title: 'Organisms / Editor / Results / Range',
  component: RangeResult,
  decorators: [withCode('range(1 .. 10)')],
} as Meta;

export const Normal: StoryFn<ComponentProps<typeof RangeResult>> = (props) => (
  <RangeResult {...props} />
);
