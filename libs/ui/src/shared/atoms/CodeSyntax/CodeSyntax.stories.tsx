import { Meta, StoryFn } from '@storybook/react';
import { CodeSyntax, TokenType } from './CodeSyntax';

export const NormalArgs = {
  variant: 'number' as TokenType,
  children: '4 * 5',
};
export default {
  title: 'Atoms / Editor / Input / Code Syntax',
  component: CodeSyntax,
} as Meta;

export const Normal: StoryFn<typeof NormalArgs> = (props) => (
  <CodeSyntax {...props} />
);
Normal.args = {
  variant: 'number',
  children: '4 * 5',
};

export const Identifier: StoryFn<typeof NormalArgs> = (props) => (
  <CodeSyntax {...props} />
);
Identifier.args = {
  variant: 'identifier',
  children: 'm/s',
};
