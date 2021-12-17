import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { withCode } from '../../storybook-utils';
import { InlineColumnResult } from './InlineColumnResult';

export default {
  title: 'Organisms / Editor / Result / Column / Inline',
  component: InlineColumnResult,
  decorators: [withCode('[10, 20, 30]')],
} as Meta;

export const Normal: Story<ComponentProps<typeof InlineColumnResult>> = (
  args
) => <InlineColumnResult {...args} />;
