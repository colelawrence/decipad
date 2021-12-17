import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { withCode } from '../../storybook-utils';
import { RangeResult } from './RangeResult';

export default {
  title: 'Organisms / Editor / Result / Range',
  component: RangeResult,
  decorators: [withCode('[1 .. 10]')],
} as Meta;

export const Normal: Story<ComponentProps<typeof RangeResult>> = (props) => (
  <RangeResult {...props} />
);
