import { ImportElementSource } from '@decipad/editor-types';
import { ComponentProps, FC } from 'react';
import {
  ConnectRanges,
  ConnectTable,
  ImportRangeCopies,
  ImportTable,
} from '../../icons';
import { InlineMenu } from '../../organisms';

const sourceToName: Record<ImportElementSource, string> = {
  decipad: 'Decipad notebook',
  csv: 'CSV',
  gsheets: 'Google Sheets',
  json: 'a JSON API',
  arrow: 'an Arrow file',
  sqlite: 'a SQLIte database',
  postgresql: 'a PostgreSQL database',
  mysql: 'a MySQL database',
  oracledb: 'an OracleDB database',
  cockroachdb: 'a CockroachDB database',
  redshift: 'a Redshift database',
  mariadb: 'a MariaDB database',
};

const groups = (
  source?: ImportElementSource
): ComponentProps<typeof InlineMenu>['groups'] => {
  const sourceName = source
    ? sourceToName[source] ?? 'unknown source'
    : 'unknown source';
  return [
    {
      items: [
        source === 'gsheets' && {
          command: 'connect-islands',
          title: 'Connect to table ranges',
          description: `Tries to find tables in your google sheets and create a live connection`,
          icon: <ConnectRanges />,
          enabled: true,
          extraSearchTerms: ['connect', 'live'],
        },
        {
          command: 'connect-all',
          title: `Connect to ${sourceName}`,
          description: `Connect to live data from this ${sourceName}`,
          icon: <ConnectTable />,
          enabled: true,
          extraSearchTerms: ['connect', 'live'],
        },
        source === 'gsheets' && {
          command: 'import-islands',
          title: 'Import table ranges',
          description: `Tries to find tables in your google sheets and import them`,
          icon: <ImportRangeCopies />,
          enabled: true,
          extraSearchTerms: ['import', 'google', 'sheets'],
        },
        {
          command: 'import-all',
          title: `Import from ${sourceName}`,
          description: `Import all data in this ${sourceName}`,
          icon: <ImportTable />,
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
