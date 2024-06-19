import type { FC } from 'react';
import { CodeConnection } from './CodeConnection';
import type { ConnectionProps } from './types';
import { CSVConnection } from './CSVConnection';
import { SQLConnection } from './sql';
import { NotionConnection } from './notion';
import { GoogleSheetConnection } from './gsheet';

// Component used for different types of connection. A bridge.
export const Connection: FC<ConnectionProps> = (props) => {
  switch (props.type) {
    case 'codeconnection':
      return <CodeConnection {...props} />;
    case 'mysql':
      return <SQLConnection {...props} />;
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
