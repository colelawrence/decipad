import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { Result } from '@decipad/language';
import { docs } from '@decipad/routing';
import { CodeLine } from './CodeLine';
import { withCode } from '../../storybook-utils';

export default {
  title: 'Organisms / Editor / Code / Line',
  component: CodeLine,
  decorators: [withCode('10')],
} as Meta;

export const Normal: Story<ComponentProps<typeof CodeLine> & Result> = ({
  type,
  value,
  ...props
}) => <CodeLine {...props} result={{ type, value }} />;
Normal.args = {
  children: '10',
};

export const WithInlineResult: Story<ComponentProps<typeof CodeLine> & Result> =
  ({ type, value, ...props }) => (
    <CodeLine {...props} result={{ type, value }} />
  );
WithInlineResult.args = {
  displayInline: true,
  children: '9 + 1',
};

export const WithError: Story<ComponentProps<typeof CodeLine> & Result> = ({
  type,
  value,
  ...props
}) => <CodeLine {...props} result={{ type, value }} />;
WithError.args = {
  children: '9 +',
  syntaxError: { message: 'Syntax Error', url: docs({}).$ },
};
