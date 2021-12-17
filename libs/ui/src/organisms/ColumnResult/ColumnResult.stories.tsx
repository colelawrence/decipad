import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { withCode } from '../../storybook-utils';
import { ColumnResult } from './ColumnResult';

export default {
  title: 'Organisms / Editor / Result / Column',
  component: ColumnResult,
  decorators: [withCode('[1, 2, 3]')],
} as Meta;

export const Normal: Story<ComponentProps<typeof ColumnResult>> = (props) => {
  return <ColumnResult {...props} />;
};
