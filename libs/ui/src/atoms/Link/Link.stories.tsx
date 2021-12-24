import { Meta, Story } from '@storybook/react';
import { Link } from './Link';

const args = {
  children: 'Text',
  href: '',
};

export default {
  title: 'Atoms / Editor / Text / Inline / Link',
  component: Link,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => <Link {...props} />;
