import { Result } from '@decipad/remote-computer';
import { docs } from '@decipad/routing';
import { Meta, StoryFn } from '@storybook/react';
import { withCode } from '../../../storybook-utils';
import {
  CodeLineStructured,
  CodeLineStructuredProps,
} from './CodeLineStructured';

export default {
  title: 'Organisms / Editor / Code / Structured Line',
  component: CodeLineStructured,
  decorators: [withCode('1 + 1')],
  args: {
    variableNameChild: 'Distance',
    codeChild: '60km/h * Time',
  },
} as Meta;

export const Normal: StoryFn<CodeLineStructuredProps & Result.Result> = ({
  type,
  value,
  meta,
  ...props
}: CodeLineStructuredProps & Result.Result) => (
  <CodeLineStructured {...props} result={{ type, value, meta }} />
);

export const WithHighlightedLine: StoryFn<
  CodeLineStructuredProps & Result.Result
> = ({
  type,
  value,
  meta,
  ...props
}: CodeLineStructuredProps & Result.Result) => (
  <CodeLineStructured {...props} result={{ type, value, meta }} />
);
WithHighlightedLine.args = {
  highlight: true,
};

export const WithExpandedResult: StoryFn<
  CodeLineStructuredProps & Result.Result
> = ({
  type,
  value,
  meta,
  ...props
}: CodeLineStructuredProps & Result.Result) => (
  <CodeLineStructured {...props} result={{ type, value, meta }} />
);
WithExpandedResult.decorators = [withCode('[1, 2, 3]')];
WithExpandedResult.args = {
  variableNameChild: 'Distance',
  codeChild: '[1, 2, 3]',
};

export const WithError: StoryFn<CodeLineStructuredProps & Result.Result> = ({
  type,
  value,
  meta,
  ...props
}: CodeLineStructuredProps & Result.Result) => (
  <CodeLineStructured {...props} result={{ type, value, meta }} />
);
WithError.args = {
  variableNameChild: 'Distance',
  codeChild: '[1, 2,',
  syntaxError: { message: 'Syntax Error', url: docs({}).$ },
};

export const WithPlaceholder: StoryFn<
  CodeLineStructuredProps & Result.Result
> = (props: CodeLineStructuredProps & Result.Result) => (
  <CodeLineStructured {...props} />
);
WithPlaceholder.args = {
  variableNameChild: 'Distance',
  codeChild: '',
};
