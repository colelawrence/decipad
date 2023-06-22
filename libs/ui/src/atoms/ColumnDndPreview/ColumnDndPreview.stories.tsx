import { Meta, StoryFn } from '@storybook/react';
import { ColumnDndPreview, ColumnDndPreviewProps } from './ColumnDndPreview';

export default {
  title: 'Atoms / UI / DND / Column Preview',
  component: ColumnDndPreview,
} as Meta;

export const Normal: StoryFn<ColumnDndPreviewProps> = () => (
  <ColumnDndPreview label={'Column'} />
);
