import type { ComponentProps } from 'react';
import type { SelectIntegration } from '@decipad/ui';
import {
  ThumbnailCode,
  ThumbnailGoogleSheet,
  ThumbnailNotion,
  ThumbnailSql,
} from '@decipad/ui/src/icons/thumbnail-icons';

export const IntegrationList: ComponentProps<
  typeof SelectIntegration
>['integrations'] = [
  {
    icon: <ThumbnailCode />,
    title: 'Code',
    description: 'Work with data from APIs using JavaScript',
    type: 'codeconnection',
    enabled: true,
  },
  {
    icon: <ThumbnailSql />,
    title: 'SQL',
    description: 'Access SQL databases with simple queries',
    type: 'mysql',
    enabled: true,
  },
  {
    icon: <ThumbnailNotion />,
    title: 'Notion',
    description: 'Connect your Notion databases to Decipad',
    type: 'notion',
    enabled: true,
  },
  {
    icon: <ThumbnailGoogleSheet />,
    title: 'Google Sheets',
    description: 'Import and analyze data from Google Sheets',
    type: 'gsheets',
    enabled: true,
  },
  {
    icon: <ThumbnailGoogleSheet />,
    title: 'CSV',
    description: 'Use your CSV data in Decipad',
    type: 'csv',
    enabled: true,
  },
];
