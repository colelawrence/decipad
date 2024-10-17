import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { withCode } from '../../../storybook-utils';
import { InlineColumnResult } from './InlineColumnResult';
import { CodeResultProps } from '../../../types';

export default {
  title: 'Organisms / Editor / Results / Column / Inline',
  component: InlineColumnResult,
  decorators: [withCode('[10, 20, 30]')],
} as Meta;

export const Normal: StoryFn<ComponentProps<typeof InlineColumnResult>> = (
  args: CodeResultProps<'materialized-column'>
) => <InlineColumnResult {...args} />;
