import { Meta } from '@storybook/react';
import { Heading1, Heading1Props } from './Heading1';

const args = { children: 'What’s possible?' };

export default {
  title: 'Atoms / Editor / Text / Block / Heading 1',
  component: Heading1,
  args,
} as Meta;

export const Normal = (props: Heading1Props) => <Heading1 {...props} />;

export const Active = (props: Heading1Props) => <Heading1 {...props} />;
