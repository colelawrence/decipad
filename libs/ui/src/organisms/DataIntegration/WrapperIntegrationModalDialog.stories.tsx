import { noop } from '@decipad/utils';
import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps, useState } from 'react';
import {
  DatabaseQuery,
  DbOptions,
  IntegrationModalDialog,
  IntegrationModalDialogProps,
  DatabaseConnectionScreen as UIDatabaseConnection,
} from '.';
import { Close } from '../../icons';
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

const ProviderList: IntegrationModalDialogProps['dataSources'] = [
  {
    name: 'Google Sheet',
    icon: <Close />,
    provider: undefined,
  },
  {
    name: 'Web API',
    icon: <Close />,
    provider: undefined,
  },
  {
    name: 'MySQL',
    icon: <Close />,
    provider: undefined,
  },
  {
    name: 'MongoDB',
    icon: <Close />,
    provider: undefined,
  },
  {
    name: 'MSSQL',
    icon: <Close />,
    provider: undefined,
  },
  {
    name: 'Oracle',
    icon: <Close />,
    provider: undefined,
  },
  {
    name: 'Redshift',
    icon: <Close />,
    provider: undefined,
  },
  {
    name: 'Postgres',
    icon: <Close />,
    provider: undefined,
  },
  {
    name: 'MariaDB',
    icon: <Close />,
    provider: undefined,
  },
  {
    name: 'Other SQL',
    icon: <Close />,
    provider: undefined,
  },
];

export const Normal: StoryFn<
  ComponentProps<typeof WrapperIntegrationModalDialog>
> = (props) => {
  return <WrapperIntegrationModalDialog {...props} />;
};

export const DataIntegrationScreen: StoryFn<
  ComponentProps<typeof WrapperIntegrationModalDialog>
> = (props) => {
  return (
    <WrapperIntegrationModalDialog {...props}>
      <IntegrationModalDialog
        onSelectSource={noop}
        dataSources={ProviderList}
      />
    </WrapperIntegrationModalDialog>
  );
};

let existingConn: DbOptions = {
  connectionString: '',
  host: '',
  port: '',
  username: '',
  password: '',
  database: '',
  existingConn: {
    name: '',
    id: '',
  },
  dbConnType: undefined,
  query: '',
};
export const DatabaseConnectionScreen: StoryFn<
  ComponentProps<typeof WrapperIntegrationModalDialog>
> = (props) => {
  return (
    <WrapperIntegrationModalDialog {...props}>
      <UIDatabaseConnection
        values={existingConn}
        setValues={(v) => {
          existingConn = {
            ...existingConn,
            ...v,
          };
        }}
        existingConnections={[
          ['con-id-1', 'Connection 1'],
          ['con-id-2', 'Conn2'],
        ]}
      />
    </WrapperIntegrationModalDialog>
  );
};

export const DatabaseConnectionScreenError: StoryFn<
  ComponentProps<typeof WrapperIntegrationModalDialog>
> = (props) => {
  return (
    <WrapperIntegrationModalDialog {...props}>
      <UIDatabaseConnection
        values={existingConn}
        setValues={(v) => {
          existingConn = {
            ...existingConn,
            ...v,
          };
        }}
        existingConnections={[
          ['con-id-1', 'Connection 1'],
          ['con-id-2', 'Conn2'],
        ]}
        error="This is an error!"
      />
    </WrapperIntegrationModalDialog>
  );
};

export const DatabaseQueryScreen: StoryFn<
  ComponentProps<typeof WrapperIntegrationModalDialog>
> = (props) => {
  const [query, setQuery] = useState('');
  return (
    <WrapperIntegrationModalDialog {...props}>
      <DatabaseQuery query={query} setQuery={setQuery} />
    </WrapperIntegrationModalDialog>
  );
};
