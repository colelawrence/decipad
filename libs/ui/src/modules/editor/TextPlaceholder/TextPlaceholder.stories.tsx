import { Meta, StoryFn } from '@storybook/react';
import { TextPlaceholder } from './TextPlaceholder';

export default {
  title: 'Molecules / UI / Notebook Placeholder',
  component: TextPlaceholder,
} as Meta;

export const Normal: StoryFn = () => <TextPlaceholder />;
