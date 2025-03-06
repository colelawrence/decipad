import { ImportElementSource } from '@decipad/editor-types';
import { ComponentProps, FC } from 'react';
import {
  CommandConnectRanges,
  CommandConnectSource,
  CommandImportCopy,
  CommandImportRangeCopies,
} from '../../../icons/command-icons';
import { InlineMenu } from '../InlineMenu/InlineMenu';

const sourceToName: Record<ImportElementSource, string> = {
  decipad: 'Decipad notebook',
  csv: 'CSV',
  gsheets: 'Google Sheets',
  json: 'a JSON API',
  postgresql: 'a PostgreSQL database',
  mysql: 'a MySQL database',
  oracledb: 'an OracleDB database',
  cockroachdb: 'a CockroachDB database',
  redshift: 'a Redshift database',
  mariadb: 'a MariaDB database',
  mssql: 'a SQL Server database',
  codeconnection: 'A code connection',
  notion: 'a Notion connection',
  bigquery: 'a BigQuery database',
  datalake: 'your workspace Data Lake',
};

const databases = [
  'postgresql',
  'mysql',
  'oracledb',
  'cockroachdb',
  'redshift',
  'mariadb',
  'mssql',
  'bigquery',
];

const groups = (
  source?: ImportElementSource
): ComponentProps<typeof InlineMenu>['groups'] => {
  const sourceName = source
    ? sourceToName[source] ?? 'unknown source'
    : 'unknown source';
  return [
    {
      items: databases.includes(source || '')
        ? [
            {
              command: 'connect-all',
              title: `Connect to ${sourceName}`,
              description: `Connect to database ${sourceName}`,
              icon: <CommandConnectSource />,
              enabled: true,
              extraSearchTerms: ['connect', 'live'],
            },
          ]
        : [
            {
              command: 'connect-all',
              title: `${sourceName} Integration`,
              description: `Live data integration from ${sourceName}. You cannot edit the data.`,
              icon: <CommandConnectSource />,
              enabled: true,
              extraSearchTerms: ['connect', 'live'],
            },
            ...(source !== 'decipad'
              ? [
                  {
                    command: 'import-all',
                    title: `Paste from ${sourceName}`,
                    description: `Make a copy from ${sourceName} and edit in Decipad. Edits are allowed.`,
                    icon: <CommandImportCopy />,
                    enabled: true,
                    extraSearchTerms: ['import', 'google', 'sheets'],
                  },
                ]
              : []),
            source === 'gsheets' && {
              command: 'connect-islands',
              title: 'Connect to table ranges',
              description: `Tries to find tables in your google sheets and create a live connection`,
              icon: <CommandConnectRanges />,
              enabled: true,
              extraSearchTerms: ['connect', 'live'],
            },
            source === 'gsheets' && {
              command: 'import-islands',
              title: 'Import table ranges',
              description: `Tries to find tables in your google sheets and import them`,
              icon: <CommandImportRangeCopies />,
              enabled: true,
              extraSearchTerms: ['import', 'google', 'sheets'],
            },
          ].filter(Boolean),
    },
  ] as ComponentProps<typeof InlineMenu>['groups'];
};

type ImportFromLinkMenuProps = Pick<
  ComponentProps<typeof InlineMenu>,
  'onExecute' | 'search'
> & {
  source?: ImportElementSource;
};

export const ImportFromLinkMenu: FC<ImportFromLinkMenuProps> = ({
  source,
  ...props
}) => {
  return <InlineMenu {...props} groups={groups(source)} />;
};
