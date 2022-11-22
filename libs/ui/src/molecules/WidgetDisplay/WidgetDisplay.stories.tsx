import { noop } from '@decipad/utils';
import { Meta, Story } from '@storybook/react';
import { WidgetDisplay, WidgetDisplayProps } from './WidgetDisplay';

const args: WidgetDisplayProps = {
  openMenu: false,
  setOpenMenu: noop,
  readOnly: false,
  children: <></>,
};

export default {
  title: 'Molecules / Editor / Widget Display',
  component: WidgetDisplay,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <WidgetDisplay {...props} />
);
