import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { withCode } from '../../storybook-utils';
import { NumberResult } from './NumberResult';

export default {
  title: 'Atoms / Editor / Results / Number',
  component: NumberResult,
} as Meta;

export const Normal: StoryFn<ComponentProps<typeof NumberResult>> = (props) => (
  <NumberResult {...props} />
);
Normal.decorators = [withCode('10')];

export const Formatted: StoryFn<ComponentProps<typeof NumberResult>> = (
  props
) => <NumberResult {...props} />;
Formatted.decorators = [withCode('10000')];

export const Decimal: StoryFn<ComponentProps<typeof NumberResult>> = (
  props
) => <NumberResult {...props} />;
Decimal.decorators = [withCode('0.1')];

export const Unit: StoryFn<ComponentProps<typeof NumberResult>> = (props) => (
  <NumberResult {...props} />
);
Unit.decorators = [withCode('1 banana + 1 banana')];

export const LongDecimal: StoryFn<ComponentProps<typeof NumberResult>> = (
  props
) => <NumberResult {...props} />;
LongDecimal.decorators = [withCode('0.123456789123456789')];
