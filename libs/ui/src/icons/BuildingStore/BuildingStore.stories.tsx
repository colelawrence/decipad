import { Meta, Story } from '@storybook/react';
import { BuildingStore } from './BuildingStore';

export default {
  title: 'Icons / Building Store',
  component: BuildingStore,
} as Meta;

export const Normal: Story = () => <BuildingStore />;
