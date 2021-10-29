import { Meta, Story } from '@storybook/react';
import { EditableCellContents } from './EditableCellContents';

export default {
  title: 'Legacy/Editor/Elements/EditableCellContents',
  component: EditableCellContents,
  args: {
    value: 'Value',
  },
} as Meta;

interface ArgsType {
  value: string;
}

export const EditableCellContentsStory: Story<ArgsType> = (args) => (
  <EditableCellContents {...args} />
);
