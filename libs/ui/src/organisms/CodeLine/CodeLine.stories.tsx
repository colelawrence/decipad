import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { Result } from '@decipad/language';
import { docs } from '@decipad/routing';
import { CodeLine } from './CodeLine';
import { withCode } from '../../storybook-utils';

export default {
  title: 'Organisms / Editor / Code / Line',
  component: CodeLine,
  decorators: [withCode('1 + 1')],
  args: {
    displayInline: true,
    children: '1 + 1',
  },
} as Meta;

export const Normal: Story<ComponentProps<typeof CodeLine> & Result> = ({
  type,
  value,
  ...props
}) => <CodeLine {...props} result={{ type, value }} />;

export const WithHighlightedLine: Story<
  ComponentProps<typeof CodeLine> & Result
> = ({ type, value, ...props }) => (
  <CodeLine {...props} result={{ type, value }} />
);
WithHighlightedLine.args = {
  displayInline: true,
  highlight: true,
};

export const WithExpandedResult: Story<
  ComponentProps<typeof CodeLine> & Result
> = ({ type, value, ...props }) => (
  <CodeLine {...props} result={{ type, value }} />
);
WithExpandedResult.decorators = [withCode('[1, 2, 3]')];
WithExpandedResult.args = {
  displayInline: false,
  children: '[1, 2, 3]',
};

export const WithError: Story<ComponentProps<typeof CodeLine> & Result> = ({
  type,
  value,
  ...props
}) => <CodeLine {...props} result={{ type, value }} />;
WithError.args = {
  children: '[1, 2,',
  syntaxError: { message: 'Syntax Error', url: docs({}).$ },
};
