import { Result } from '@decipad/remote-computer';
import { docs } from '@decipad/routing';
import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { withCode } from '../../storybook-utils';
import { CodeLine } from './CodeLine';

export default {
  title: 'Organisms / Editor / Code / Line',
  component: CodeLine,
  decorators: [withCode('1 + 1')],
  args: {
    children: '1 + 1',
  },
} as Meta;

export const Normal: StoryFn<
  ComponentProps<typeof CodeLine> & Result.Result
> = ({ type, value, ...props }) => (
  <CodeLine {...props} result={{ type, value }} />
);

export const WithHighlightedLine: StoryFn<
  ComponentProps<typeof CodeLine> & Result.Result
> = ({ type, value, ...props }) => (
  <CodeLine {...props} result={{ type, value }} />
);
WithHighlightedLine.args = {
  highlight: true,
};

export const WithExpandedResult: StoryFn<
  ComponentProps<typeof CodeLine> & Result.Result
> = ({ type, value, ...props }) => (
  <CodeLine {...props} result={{ type, value }} />
);
WithExpandedResult.decorators = [withCode('[1, 2, 3]')];
WithExpandedResult.args = {
  children: '[1, 2, 3]',
};

export const WithError: StoryFn<
  ComponentProps<typeof CodeLine> & Result.Result
> = ({ type, value, ...props }) => (
  <CodeLine {...props} result={{ type, value }} />
);
WithError.args = {
  children: '[1, 2,',
  syntaxError: { message: 'Syntax Error', url: docs({}).$ },
};

export const WithPlaceholder: StoryFn<
  ComponentProps<typeof CodeLine> & Result.Result
> = (props) => <CodeLine {...props} />;
WithPlaceholder.args = {
  children: '',
  isEmpty: true,
  placeholder: 'Distance = 60km/h * Time',
};
