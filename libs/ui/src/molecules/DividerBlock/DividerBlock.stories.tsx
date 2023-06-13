import { Meta, StoryFn } from '@storybook/react';
import { DividerBlock } from './DividerBlock';

export default {
  title: 'Molecules / Editor / Divider Block',
  component: DividerBlock,
} as Meta;

export const Normal: StoryFn = () => <DividerBlock />;
