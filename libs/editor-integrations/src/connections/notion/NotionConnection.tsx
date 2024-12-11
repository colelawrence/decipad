import type { FC } from 'react';
import type { ConnectionProps } from '../types';
import { NotionPrivateDatabases } from './DatabaseSelector';
import { Loading, OAuthConnections } from '../shared';

export const NotionConnection: FC<ConnectionProps> = (props) => {
  return (
    <>
      <OAuthConnections
        {...props}
        label="Select or connect Notion account"
        placeholder="Select account"
        provider="notion"
      />
      <NotionPrivateDatabases {...props} />
      <Loading info={props.info} />
    </>
  );
};
