import { FC } from 'react';
import { CodeConnection } from './CodeConnection';
import { ConnectionProps } from './types';
import { SQLConnection } from './SQLConnection';

// Component used for different types of connection. A bridge.
export const Connection: FC<ConnectionProps> = (props) => {
  switch (props.type) {
    case undefined:
      return null;
    case 'codeconnection':
      return <CodeConnection {...props} />;
    case 'mysql':
      return <SQLConnection {...props} />;
    // STUB
    default:
      return null;
  }
};
