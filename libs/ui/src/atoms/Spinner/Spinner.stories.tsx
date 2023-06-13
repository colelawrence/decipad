import { Meta, StoryFn } from '@storybook/react';
import { Spinner } from './Spinner';

export default {
  title: 'Atoms / Spinner',
  component: Spinner,
} as Meta;

export const Normal: StoryFn = (props) => <Spinner {...props} />;
