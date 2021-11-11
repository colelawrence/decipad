import { Meta, Story } from '@storybook/react';
import { CellInput, CellInputProps } from './CellInput';

export default {
  title: 'Atoms / Table / Cell Input',
  component: CellInput,
  args: {
    value: 'Edit me',
  },
} as Meta;

export const Normal: Story<CellInputProps> = (args) => <CellInput {...args} />;

export const HeadingVariant: Story<CellInputProps> = (args) => (
  <CellInput variant="heading" {...args} />
);

export const HeaderVariant: Story<CellInputProps> = (args) => (
  <CellInput variant="header" {...args} />
);

export const DataVariant: Story<CellInputProps> = (args) => (
  <CellInput variant="data" {...args} />
);
