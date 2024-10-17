// SearchFieldWithDropdown.stories.tsx
import { Meta, StoryFn } from '@storybook/react';
import {
  SearchFieldWithDropdown,
  SearchFieldWithDropdownProps,
} from './SearchFieldWithDropdown';

export default {
  title: 'Molecules / UI / SearchFieldWithDropdown',
  component: SearchFieldWithDropdown,
} as Meta;

const Template: StoryFn<SearchFieldWithDropdownProps> = (
  args: SearchFieldWithDropdownProps
) => <SearchFieldWithDropdown {...args} />;

export const Default = Template.bind({});
Default.args = {
  searchTerm: '',
  onSearchChange: () => {},
  placeholder: 'Search...',
  dropdownChoices: [{ label: 'Choice 1', description: 'Description 1' }],
  selectedDropdownValue: 'Choice 1',
  handleDropdownChange: () => {},
};

export const NoDropdown = Template.bind({});
NoDropdown.args = {
  searchTerm: '',
  onSearchChange: () => {},
  placeholder: 'Search...',
};
