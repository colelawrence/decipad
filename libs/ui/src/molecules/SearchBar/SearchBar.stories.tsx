import { Meta, Story } from '@storybook/react';
import { SearchBar } from './SearchBar';

export default {
  title: 'Molecules / UI / Dashboard / Search Bar',
  component: SearchBar,
} as Meta;

export const Normal: Story = () => <SearchBar />;
