import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { withCode } from '../../storybook-utils';
import { DateResult } from './DateResult';

export default {
  title: 'Atoms / Editor / Result / Date',
  component: DateResult,
} as Meta;

export const Normal: Story<ComponentProps<typeof DateResult>> = (props) => (
  <DateResult {...props} />
);
Normal.decorators = [withCode('date(2021-01-01)')];

export const Month: Story<ComponentProps<typeof DateResult>> = (props) => (
  <DateResult {...props} />
);
Month.decorators = [withCode('date(2021-01)')];

export const Year: Story<ComponentProps<typeof DateResult>> = (props) => (
  <DateResult {...props} />
);
Year.decorators = [withCode('date(2021)')];

export const Time: Story<ComponentProps<typeof DateResult>> = (props) => (
  <DateResult {...props} />
);
Time.decorators = [withCode('date(2021-01-01 00:00)')];
