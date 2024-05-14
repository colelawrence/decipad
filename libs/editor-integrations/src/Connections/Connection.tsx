import type { FC } from 'react';
import { CodeConnection } from './CodeConnection';
import type { ConnectionProps } from './types';
import { SQLConnection } from './SQLConnection';
import { NotionConnection } from './NotionConnection';
import { GoogleSheetConnection } from './GoogleSheetConnection';

// Component used for different types of connection. A bridge.
export const Connection: FC<ConnectionProps> = (props) => {
  switch (props.type) {
    case undefined:
      return null;
    case 'codeconnection':
      return <CodeConnection {...props} />;
    case 'mysql':
      return <SQLConnection {...props} />;
    case 'notion':
      return <NotionConnection {...props} />;
    case 'gsheets':
      return <GoogleSheetConnection {...props} />;
    default:
      return null;
  }
};
