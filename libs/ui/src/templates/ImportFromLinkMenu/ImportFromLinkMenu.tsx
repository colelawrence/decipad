import { ImportElementSource } from '@decipad/editor-types';
import { ComponentProps, FC } from 'react';
import { Calculations, Import } from '../../icons';
import { InlineMenu } from '../../organisms';

const sourceToName: Record<ImportElementSource, string> = {
  csv: 'CSV',
  gsheets: 'Google Sheets',
  json: 'a JSON API',
  arrow: 'an Arrow file',
};

const groups = (source?: ImportElementSource) => {
  const sourceName = source ? sourceToName[source] : 'unknown source';
  return [
    {
      items: [
        {
          command: 'import',
          title: 'Import',
          description: `Import data from ${sourceName}`,
          icon: <Import />,
          enabled: true,
          extraSearchTerms: ['import', 'google', 'sheets'],
        },
        {
          command: 'connect',
          title: 'Connect',
          description: `Connect to live data from ${sourceName}`,
          icon: <Calculations />,
          enabled: true,
          extraSearchTerms: ['connect', 'live'],
        },
      ],
    },
  ];
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
