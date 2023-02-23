import { Meta, Story } from '@storybook/react';
import { inMenu } from '../../storybook-utils';
import { ASTUnitMenuItem } from './ASTUnitMenuItem';

interface Args {
  children: string;
}

export default {
  title: 'Molecules / Editor / Table / Units / Menu Item (AST-Based)',
  component: ASTUnitMenuItem,
  decorators: [inMenu],
} as Meta<Args>;

export const Normal: Story = () => <ASTUnitMenuItem />;
