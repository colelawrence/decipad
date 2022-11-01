import { ImportElementSource } from '@decipad/editor-types';
import pluralize from 'pluralize';
import { ComponentProps, FC } from 'react';
import { Calculations, Import } from '../../icons';
import { InlineMenu } from '../../organisms';

const sourceToName: Record<ImportElementSource, string> = {
  decipad: 'Decipad notebook',
  csv: 'CSV',
  gsheets: 'Google Sheets',
  json: 'a JSON API',
  arrow: 'an Arrow file',
};

const groups = (
  source?: ImportElementSource
): ComponentProps<typeof InlineMenu>['groups'] => {
  const sourceName = source ? sourceToName[source] : 'unknown source';
  return [
    {
      items: [
        source === 'gsheets' && {
          command: 'connect-islands',
          title: 'Find and connect to ranges',
          description: `Find individual blocks and create a connection for each one in this gsheet`,
          icon: <Calculations />,
          enabled: true,
          extraSearchTerms: ['connect', 'live'],
        },
        {
          command: 'connect-all',
          title: 'Connect',
          description: `Connect to live data from this ${pluralize.singular(
            sourceName
          )}`,
          icon: <Calculations />,
          enabled: true,
          extraSearchTerms: ['connect', 'live'],
        },
        source === 'gsheets' && {
          command: 'import-islands',
          title: 'Import islands of data',
          description: `Find individual blocks in this gsheet and import each range as a separate table`,
          icon: <Import />,
          enabled: true,
          extraSearchTerms: ['import', 'google', 'sheets'],
        },
        {
          command: 'import-all',
          title: 'Import',
          description: `Import all data in this ${pluralize.singular(
            sourceName
          )}`,
          icon: <Import />,
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
