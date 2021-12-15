import { Meta, Story } from '@storybook/react';
import { Type } from '@decipad/language';
import { ColumnResult } from './ColumnResult';

const type = { cellType: { type: 'number' } } as Type;
const args = {
  value: [1, 2, 3],
};

export default {
  title: 'Organisms / Editor / Result / Column',
  component: ColumnResult,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => {
  return <ColumnResult {...props} type={type} />;
};

export const Inline: Story<typeof args> = (props) => {
  return <ColumnResult {...props} type={type} variant="inline" />;
};
