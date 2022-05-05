import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { withCode } from '../../storybook-utils';
import { BooleanResult } from './BooleanResult';

export default {
  title: 'Atoms / Editor / Results / Boolean',
  component: BooleanResult,
} as Meta;

export const Selected: Story<ComponentProps<typeof BooleanResult>> = (
  props
) => <BooleanResult {...props} />;
Selected.decorators = [withCode('true')];

export const Unselected: Story<ComponentProps<typeof BooleanResult>> = (
  props
) => <BooleanResult {...props} />;
Unselected.decorators = [withCode('false')];
