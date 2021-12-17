import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { withCode } from '../../storybook-utils';
import { InlineCodeResult } from './InlineCodeResult';

export default {
  title: 'Organisms / Editor / Result / Inline',
  component: InlineCodeResult,
  decorators: [withCode('["Lorem", "Ipsum", "Dolor", "Sit", "Amet"]')],
} as Meta;

export const Normal: Story<ComponentProps<typeof InlineCodeResult>> = (
  props
) => <InlineCodeResult {...props} />;
