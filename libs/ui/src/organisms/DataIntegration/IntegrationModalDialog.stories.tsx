import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { IntegrationModalDialog } from './IntegrationModalDialog';

export default {
  title: 'Organisms / UI / Data Integrations / Data Integrations Model',
  component: IntegrationModalDialog,
} as Meta;

export const Normal: StoryFn<ComponentProps<typeof IntegrationModalDialog>> = (
  props
) => {
  return <IntegrationModalDialog {...props} />;
};
