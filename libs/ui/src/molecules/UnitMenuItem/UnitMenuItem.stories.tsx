import { Units } from '@decipad/language';
import { Meta, Story } from '@storybook/react';
import { inMenu } from '../../storybook-utils';
import { UnitMenuItem } from './UnitMenuItem';

interface Args {
  children: string;
}

export default {
  title: 'Molecules / Editor / Table / Units / Menu Item',
  component: UnitMenuItem,
  decorators: [inMenu],
} as Meta<Args>;

export const Normal: Story = () => (
  <UnitMenuItem parseUnit={() => Promise.resolve({} as Units)} />
);
