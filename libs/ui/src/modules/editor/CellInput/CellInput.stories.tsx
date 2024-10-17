import { Meta, StoryFn } from '@storybook/react';
import { CellInput, CellInputProps } from './CellInput';

export default {
  title: 'Atoms / Editor / Table / Cell',
  component: CellInput,
  args: {
    value: 'Edit me',
  },
} as Meta;

export const Normal: StoryFn<CellInputProps> = (args: CellInputProps) => (
  <CellInput {...args} />
);

export const HeadingVariant: StoryFn<CellInputProps> = (
  args: CellInputProps
) => <CellInput variant="heading" {...args} />;

export const HeaderVariant: StoryFn<CellInputProps> = (
  args: CellInputProps
) => <CellInput variant="header" {...args} />;

export const DataVariant: StoryFn<CellInputProps> = (args: CellInputProps) => (
  <CellInput variant="data" {...args} />
);
