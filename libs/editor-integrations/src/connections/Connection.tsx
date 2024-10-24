import type { FC } from 'react';
import type { ConnectionProps } from './types';

import { CodeConnection } from './code';
import { CSVConnection } from './csv';
import { SQLConnection, SQLConnectionPicker } from './sql';
import { NotionConnection } from './notion';
import { GoogleSheetConnection } from './gsheet';
import { Logs } from '@decipad/ui';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import { createPortal } from 'react-dom';

const ConnectionDataDrawer: FC<ConnectionProps> = (props) => {
  switch (props.connectionType) {
    case 'csv':
    case 'gsheets':
    case 'notion':
      return null;
    case 'codeconnection':
      return <CodeConnection {...props} />;
    case 'mysql':
      return <SQLConnection {...props} />;
    default:
      return null;
  }
};

const ConnectionDataDrawerPortal: FC<ConnectionProps> = (props) => {
  const isDataDrawerOpen = useNotebookWithIdState((s) => s.isDataDrawerOpen);

  if (!isDataDrawerOpen) {
    return null;
  }

  return createPortal(
    <ConnectionDataDrawer {...props} />,
    document.getElementById('data-drawer-content')!
  );
};

const ConnectionSidebar: FC<ConnectionProps> = (props) => {
  switch (props.connectionType) {
    case 'codeconnection':
      return <Logs logs={props.info} type="javascript" />;
    case 'mysql':
      return (
        <>
          <SQLConnectionPicker {...props} />
          <Logs logs={props.info} type="sql" />
        </>
      );
    case 'notion':
      return <NotionConnection {...props} />;
    case 'gsheets':
      return <GoogleSheetConnection {...props} />;
    case 'csv':
      return <CSVConnection {...props} />;
    default:
      return null;
  }
};

// Component used for different types of connection. A bridge.
export const Connection: FC<ConnectionProps> = (props) => {
  if (props.stage !== 'connect') {
    return null;
  }

  return (
    <>
      <ConnectionSidebar {...props} />
      <ConnectionDataDrawerPortal {...props} />
    </>
  );
};
