import { Meta, Story } from '@storybook/react';
import { ParagraphPlaceholder } from './ParagraphPlaceholder';

export default {
  title: 'Molecules / Paragraph Placeholder',
  component: ParagraphPlaceholder,
} as Meta;

export const Normal: Story = () => <ParagraphPlaceholder />;
