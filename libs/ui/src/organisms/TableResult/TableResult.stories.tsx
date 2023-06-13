import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { withCode } from '../../storybook-utils';
import { TableResult } from './TableResult';

export default {
  title: 'Organisms / Editor / Results / Table',
  component: TableResult,
  decorators: [
    withCode(
      'my_table = { VeryLongHeading1 = [1, 2], VeryLongHeading2 = ["A", "B"], VeryLongHeading3 = ["C", "D"]}'
    ),
  ],
} as Meta;

export const Normal: StoryFn<ComponentProps<typeof TableResult>> = (
  props: any
) => {
  return <TableResult {...props} />;
};
