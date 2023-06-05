import { FC } from 'react';
import { Result } from '@decipad/computer';
import { ImportElementSource } from '@decipad/editor-types';
import { CodeConnection } from './CodeConnection';

export interface ConnectionProps {
  type?: ImportElementSource;
  setResultPreview: (res: Result.Result | undefined) => void;
}

// Component used for different types of connection. A bridge.
export const Connection: FC<ConnectionProps> = (props) => {
  switch (props.type) {
    case undefined:
      return null;
    case 'codeconnection':
      return <CodeConnection {...props} />;
    // STUB
    default:
      return null;
  }
};
