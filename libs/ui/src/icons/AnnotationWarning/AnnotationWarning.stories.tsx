import { Meta, Story } from '@storybook/react';
import { AnnotationWarning } from './AnnotationWarning';

export default {
  title: 'Icons / Annotation Warning',
  component: AnnotationWarning,
} as Meta;

export const Normal: Story = () => <AnnotationWarning />;
