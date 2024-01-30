import { Meta, StoryFn } from '@storybook/react';
import { Link } from './Link';

const args = {
  children: 'Discord',
  href: 'https://discord.com',
};

export default {
  title: 'Atoms / Editor / Text / Mark / Link',
  component: Link,
  args,
  decorators: [
    (St) => (
      <div>
        We hope to see you on <St /> 👋.
      </div>
    ),
  ],
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => <Link {...props} />;
