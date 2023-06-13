import { noop } from '@decipad/utils';
import { Meta, StoryFn } from '@storybook/react';
import { WidgetDisplay, WidgetDisplayProps } from './WidgetDisplay';

const args: WidgetDisplayProps = {
  openMenu: false,
  setOpenMenu: noop,
  readOnly: false,
  allowOpen: true,
  children: <></>,
};

export default {
  title: 'Molecules / Editor / Widget Display',
  component: WidgetDisplay,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => (
  <WidgetDisplay {...props} />
);
