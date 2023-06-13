import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { withCode } from '../../storybook-utils';
import { DateResult } from './DateResult';

export default {
  title: 'Atoms / Editor / Results / Date',
  component: DateResult,
} as Meta;

export const Normal: StoryFn<ComponentProps<typeof DateResult>> = (props) => (
  <DateResult {...props} />
);
Normal.decorators = [withCode('date(2021-01-01)')];

export const Month: StoryFn<ComponentProps<typeof DateResult>> = (props) => (
  <DateResult {...props} />
);
Month.decorators = [withCode('date(2021-01)')];

export const Year: StoryFn<ComponentProps<typeof DateResult>> = (props) => (
  <DateResult {...props} />
);
Year.decorators = [withCode('date(2021)')];

export const Time: StoryFn<ComponentProps<typeof DateResult>> = (props) => (
  <DateResult {...props} />
);
Time.decorators = [withCode('date(2021-01-01 00:00)')];
