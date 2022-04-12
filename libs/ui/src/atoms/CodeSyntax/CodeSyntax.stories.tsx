import { Meta, Story } from '@storybook/react';

import { CodeSyntax } from './CodeSyntax';

const args = {
  variant: 'number',
};

export default {
  title: 'Atoms / Editor / Expression Editor / Code Syntax',
  component: CodeSyntax,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <CodeSyntax {...props} variant="number" />
);

export const Identifier: Story<typeof args> = (props) => (
  <CodeSyntax {...props} variant="identifier" />
);
