import { Meta } from '@storybook/react';
import { Caret } from './Caret';

export default {
  title: 'Icons / Caret',
  component: Caret,
} as Meta;

export const Expand = () => <Caret type="expand" />;
export const Collapse = () => <Caret type="collapse" />;
