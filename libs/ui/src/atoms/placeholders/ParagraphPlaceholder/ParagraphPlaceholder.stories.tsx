import { Meta, StoryFn } from '@storybook/react';
import { ParagraphPlaceholder } from './ParagraphPlaceholder';

export default {
  title: 'Molecules / UI / Notebook Placeholder',
  component: ParagraphPlaceholder,
} as Meta;

export const Normal: StoryFn = () => <ParagraphPlaceholder />;
