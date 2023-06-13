import { Meta, StoryFn } from '@storybook/react';
import { WithCodeProps, withCode } from '../../storybook-utils';
import { RowResult } from './RowResult';

const code = `
  Table = {
    Names = ["Adam", "Eve"]
    Dates = [date(2030), date(2069)]
  }
  Table

  lookup(Table, Table.Dates == date(2030))
`;

export default {
  title: 'Organisms / Editor / Results / Row',
  component: RowResult,
  decorators: [withCode(code)],
} as Meta;

export const Normal: StoryFn<WithCodeProps<'row'>> = (props) => {
  return <RowResult {...props} />;
};
