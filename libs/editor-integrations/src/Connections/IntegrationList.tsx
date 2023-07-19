import { ComponentProps } from 'react';
import { useConnectionStore } from '@decipad/react-contexts';
import {
  GoogleSheet,
  MongoDb,
  OtherSql,
  SelectIntegration,
  WebApi,
  icons,
} from '@decipad/ui';
import { noop } from '@decipad/utils';
import { isFlagEnabled } from '@decipad/feature-flags';

const store = useConnectionStore.getState();
export const IntegrationList: ComponentProps<
  typeof SelectIntegration
>['integrations'] = [
  {
    icon: <img alt="Code Connection" src={WebApi} />,
    title: 'Code',
    description:
      'Harness the power of JavaScript to manipulate data from web APIs.',
    onClick: () => {
      store.setConnectionType('codeconnection');
      store.setStage('connect');
    },
    enabled: true,
  },
  {
    icon: <img alt="SQL" src={OtherSql} />,
    title: 'SQL',
    description:
      'Effortlessly access data from SQL databases through simple queries.',
    onClick: () => {
      store.setConnectionType('mysql');
      store.setStage('connect');
    },
    enabled: isFlagEnabled('WORKSPACE_CONNECTIONS'),
  },
  {
    icon: <img alt="Google Sheet" src={GoogleSheet} />,
    title: 'Google sheet',
    description: 'Import, collaborate, and analyze Google Sheets data.',
    onClick: noop,
    enabled: false,
  },
  {
    icon: <icons.Paperclip />,
    title: 'CSV',
    description: 'Loads a CSV to Decipad',
    onClick: noop,
    enabled: false,
  },
  {
    icon: <img alt="MongoDB" src={MongoDb} />,
    title: 'MongoDB',
    description: 'Easily retrieve your documents by connecting to MongoDB.',
    onClick: noop,
    enabled: false,
  },
];
