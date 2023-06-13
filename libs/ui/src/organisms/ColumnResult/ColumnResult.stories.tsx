import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { withCode } from '../../storybook-utils';
import { ColumnResult } from './ColumnResult';

export default {
  title: 'Organisms / Editor / Results / Column',
  component: ColumnResult,
  decorators: [withCode('[1, 2, 3]')],
} as Meta;

export const Normal: StoryFn<ComponentProps<typeof ColumnResult>> = (props) => {
  return <ColumnResult {...props} />;
};
