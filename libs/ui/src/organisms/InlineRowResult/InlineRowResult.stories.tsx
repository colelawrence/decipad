import { Meta, Story } from '@storybook/react';
import { withCode, WithCodeProps } from '../../storybook-utils';
import { InlineRowResult } from './InlineRowResult';

const code = `
  Table = {
    Names = ["Adam", "Eve"]
    Dates = [date(2030), date(2069)]
  }
  Table

  lookup(Table, Table.Dates == date(2030))
`;

export default {
  title: 'Organisms / Editor / Result / Row / Inline',
  component: InlineRowResult,
  decorators: [withCode(code)],
} as Meta;

export const Normal: Story<WithCodeProps<'row'>> = (args) => (
  <InlineRowResult {...args} />
);
