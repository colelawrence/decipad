import { Meta, StoryFn } from '@storybook/react';
import { MenuSeparator } from './MenuSeparator';

interface Args {
  children: string;
}

export default {
  title: 'Atoms / UI / Menu / Separator',
  component: MenuSeparator,
} as Meta<Args>;

export const Normal: StoryFn = () => <MenuSeparator />;
