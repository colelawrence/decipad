import { Result } from '@decipad/remote-computer';
import { docs } from '@decipad/routing';
import { Meta, StoryFn } from '@storybook/react';
import { withCode } from '../../../storybook-utils';
import { CodeLine, CodeLineProps } from './CodeLine';

export default {
  title: 'Organisms / Editor / Code / Line',
  component: CodeLine,
  decorators: [withCode('1 + 1')],
  args: {
    children: '1 + 1',
  },
} as Meta;

export const Normal: StoryFn<CodeLineProps & Result.Result> = ({
  type,
  value,
  meta,
  ...props
}: CodeLineProps & Result.Result) => (
  <CodeLine {...props} result={{ type, value, meta }} />
);

export const WithHighlightedLine: StoryFn<CodeLineProps & Result.Result> = ({
  type,
  value,
  meta,
  ...props
}: CodeLineProps & Result.Result) => (
  <CodeLine {...props} result={{ type, value, meta }} />
);
WithHighlightedLine.args = {
  highlight: true,
};

export const WithExpandedResult: StoryFn<CodeLineProps & Result.Result> = ({
  type,
  value,
  meta,
  ...props
}: CodeLineProps & Result.Result) => (
  <CodeLine {...props} result={{ type, value, meta }} />
);
WithExpandedResult.decorators = [withCode('[1, 2, 3]')];
WithExpandedResult.args = {
  children: '[1, 2, 3]',
};

export const WithError: StoryFn<CodeLineProps & Result.Result> = ({
  type,
  value,
  meta,
  ...props
}: CodeLineProps & Result.Result) => (
  <CodeLine {...props} result={{ type, value, meta }} />
);
WithError.args = {
  children: '[1, 2,',
  syntaxError: { message: 'Syntax Error', url: docs({}).$ },
};

export const WithPlaceholder: StoryFn<CodeLineProps & Result.Result> = (
  props: CodeLineProps & Result.Result
) => <CodeLine {...props} />;
WithPlaceholder.args = {
  children: '',
  isEmpty: true,
  placeholder: 'Distance = 60km/h * Time',
};
