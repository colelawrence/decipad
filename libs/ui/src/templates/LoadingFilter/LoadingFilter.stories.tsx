import { Meta } from '@storybook/react';
import { LoadingFilter } from './LoadingFilter';

export default {
  title: 'Templates / Loading Filter',
  component: LoadingFilter,
} as Meta;

export const Normal = () => <LoadingFilter loading>content</LoadingFilter>;
