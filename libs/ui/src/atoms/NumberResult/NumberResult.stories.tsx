import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { withCode } from '../../storybook-utils';
import { NumberResult } from './NumberResult';

export default {
  title: 'Atoms / Editor / Results / Number',
  component: NumberResult,
} as Meta;

export const Normal: Story<ComponentProps<typeof NumberResult>> = (props) => (
  <NumberResult {...props} />
);
Normal.decorators = [withCode('10')];

export const Formatted: Story<ComponentProps<typeof NumberResult>> = (
  props
) => <NumberResult {...props} />;
Formatted.decorators = [withCode('10000')];

export const Decimal: Story<ComponentProps<typeof NumberResult>> = (props) => (
  <NumberResult {...props} />
);
Decimal.decorators = [withCode('0.1')];

export const Unit: Story<ComponentProps<typeof NumberResult>> = (props) => (
  <NumberResult {...props} />
);
Unit.decorators = [withCode('1 banana + 1 banana')];

export const LongDecimal: Story<ComponentProps<typeof NumberResult>> = (
  props
) => <NumberResult {...props} />;
LongDecimal.decorators = [withCode('0.123456789123456789')];
