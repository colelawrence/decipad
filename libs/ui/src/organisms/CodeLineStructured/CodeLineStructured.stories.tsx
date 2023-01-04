import { Result } from '@decipad/language';
import { docs } from '@decipad/routing';
import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { withCode } from '../../storybook-utils';
import { CodeLineStructured } from './CodeLineStructured';

export default {
  title: 'Organisms / Editor / Code / Line',
  component: CodeLineStructured,
  decorators: [withCode('1 + 1')],
  args: {
    variableNameChild: 'Distance',
    codeChild: '60km/h * Time',
  },
} as Meta;

export const Normal: Story<
  ComponentProps<typeof CodeLineStructured> & Result.Result
> = ({ type, value, ...props }) => (
  <CodeLineStructured {...props} result={{ type, value }} />
);

export const WithHighlightedLine: Story<
  ComponentProps<typeof CodeLineStructured> & Result.Result
> = ({ type, value, ...props }) => (
  <CodeLineStructured {...props} result={{ type, value }} />
);
WithHighlightedLine.args = {
  highlight: true,
};

export const WithExpandedResult: Story<
  ComponentProps<typeof CodeLineStructured> & Result.Result
> = ({ type, value, ...props }) => (
  <CodeLineStructured {...props} result={{ type, value }} />
);
WithExpandedResult.decorators = [withCode('[1, 2, 3]')];
WithExpandedResult.args = {
  variableNameChild: 'Distance',
  codeChild: '[1, 2, 3]',
};

export const WithError: Story<
  ComponentProps<typeof CodeLineStructured> & Result.Result
> = ({ type, value, ...props }) => (
  <CodeLineStructured {...props} result={{ type, value }} />
);
WithError.args = {
  variableNameChild: 'Distance',
  codeChild: '[1, 2,',
  syntaxError: { message: 'Syntax Error', url: docs({}).$ },
};

export const WithPlaceholder: Story<
  ComponentProps<typeof CodeLineStructured> & Result.Result
> = ({ type, value, ...props }) => <CodeLineStructured {...props} />;
WithPlaceholder.args = {
  variableNameChild: 'Distance',
  codeChild: '',
  isEmpty: true,
  placeholder: 'Distance = 60km/h * Time',
};
