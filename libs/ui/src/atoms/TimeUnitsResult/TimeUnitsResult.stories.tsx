import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { withCode } from '../../storybook-utils';
import { TimeUnitsResult } from './TimeUnitsResult';

export default {
  title: 'Atoms / Editor / Result / Time Units',
  component: TimeUnitsResult,
  decorators: [withCode('[1 month, 10 days]')],
} as Meta;

export const Normal: Story<ComponentProps<typeof TimeUnitsResult>> = (
  props
) => <TimeUnitsResult {...props} />;
