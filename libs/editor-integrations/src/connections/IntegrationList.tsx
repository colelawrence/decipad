import type { ComponentProps } from 'react';
import { useConnectionStore } from '@decipad/react-contexts';
import type { SelectIntegration } from '@decipad/ui';
import {
  ThumbnailCode,
  ThumbnailGoogleSheet,
  ThumbnailNotion,
  ThumbnailSql,
} from '@decipad/ui/src/icons/thumbnail-icons';
import { isFlagEnabled } from '@decipad/feature-flags';

const store = useConnectionStore.getState();
export const IntegrationList: ComponentProps<
  typeof SelectIntegration
>['integrations'] = [
  {
    icon: <ThumbnailCode />,
    title: 'Code',
    description:
      'Harness the power of JavaScript to manipulate data from web APIs.',
    onClick: () => {
      store.Set({ connectionType: 'codeconnection' });
      store.Set({ stage: 'connect' });
    },
    enabled: true,
  },
  {
    icon: <ThumbnailSql />,
    title: 'SQL',
    description:
      'Effortlessly access data from SQL databases through simple queries.',
    onClick: () => {
      store.Set({ connectionType: 'mysql' });
      store.Set({ stage: 'connect' });
    },
    enabled: true,
  },
  {
    icon: <ThumbnailNotion />,
    title: 'Notion',
    description: 'Connect your notion databases to decipad.',
    onClick: () => {
      store.Set({ connectionType: 'notion' });
      store.Set({ stage: 'connect' });
    },
    enabled: isFlagEnabled('NOTION_CONNECTIONS'),
  },
  {
    icon: <ThumbnailGoogleSheet />,
    title: 'Google sheet',
    description: 'Import, collaborate, and analyze Google Sheets data.',
    onClick: () => {
      store.Set({ connectionType: 'gsheets', stage: 'connect' });
    },
    enabled: isFlagEnabled('GOOGLE_SHEET_INTEGRATION'),
  },
  {
    icon: <ThumbnailGoogleSheet />,
    title: 'CSV',
    description: 'Easily retrieve your CSV and use it in Deci.',
    onClick: () => {
      store.Set({ connectionType: 'csv', stage: 'connect' });
    },
    enabled: true,
  },
];
