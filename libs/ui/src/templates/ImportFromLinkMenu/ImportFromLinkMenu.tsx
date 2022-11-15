import { ImportElementSource } from '@decipad/editor-types';
import pluralize from 'pluralize';
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
};

const groups = (
  source?: ImportElementSource
): ComponentProps<typeof InlineMenu>['groups'] => {
  const sourceName = source ? sourceToName[source] : 'unknown source';
  const ppSource = pluralize.singular(sourceName).toLocaleLowerCase();
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
          title: `Connect to ${ppSource}`,
          description: `Connect to live data from this ${ppSource}`,
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
          title: `Import from ${ppSource}`,
          description: `Import all data in this ${ppSource}`,
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
