import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { DatabaseConnectionScreen as UIDatabaseConnection } from '.';
import { WrapperIntegrationModalDialog } from './WrapperIntegrationModalDialog';

export default {
  title: 'Organisms / UI / Integrations / Integrations Modal',
  component: WrapperIntegrationModalDialog,
  argTypes: {
    isConnectDisabled: {
      control: 'boolean',
      defaultValue: true,
    },
    isConnectShown: {
      control: 'boolean',
      defaultValue: true,
    },
    showTabs: {
      control: 'boolean',
      defaultValue: true,
    },
    tabStage: {
      control: 'radio',
      options: ['connection', 'query', 'mapping'],
      defaultValue: 'connection',
    },
    title: { control: 'text', defaultValue: 'Data Integration' },
  },
} as Meta;

export const Normal: StoryFn<
  ComponentProps<typeof WrapperIntegrationModalDialog>
> = (props) => {
  return <WrapperIntegrationModalDialog {...props} />;
};

export const DatabaseConnectionScreen: StoryFn<
  ComponentProps<typeof WrapperIntegrationModalDialog>
> = (props) => {
  return (
    <WrapperIntegrationModalDialog {...props}>
      <UIDatabaseConnection workspaceId="workspace_id" />
    </WrapperIntegrationModalDialog>
  );
};

export const DatabaseConnectionScreenError: StoryFn<
  ComponentProps<typeof WrapperIntegrationModalDialog>
> = (props) => {
  return (
    <WrapperIntegrationModalDialog {...props}>
      <UIDatabaseConnection workspaceId="workspaceid" />
    </WrapperIntegrationModalDialog>
  );
};
