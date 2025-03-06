import { FC, useCallback } from 'react';
import { DataLakePossibleDataConnection } from './ActiveDataLake';
import { Button } from '../../../shared/atoms';
import { h1, p8Regular } from '../../../primitives';
import { css } from '@emotion/react';

export interface NewDataLakeConnectionProps {
  connection: DataLakePossibleDataConnection;
  newConnectionAction: (
    connection: DataLakePossibleDataConnection['sourceType']
  ) => Promise<unknown>;
}

const newDataLakeConnectionStyles = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '12px',
  alignItems: 'center',
  marginBottom: '12px',
});

const iconStyles = css({
  width: '24px',
  height: '24px',
});

export const NewDataLakeConnection: FC<NewDataLakeConnectionProps> = ({
  connection,
  newConnectionAction,
}) => {
  return (
    <div css={newDataLakeConnectionStyles}>
      <img
        css={iconStyles}
        alt={connection.displayName}
        src={connection.icon}
      />
      <h1 css={h1}>{connection.displayName}</h1>
      <p css={p8Regular}>{connection.description}</p>
      <Button
        onClick={useCallback(
          () => newConnectionAction(connection.sourceType),
          [newConnectionAction, connection.sourceType]
        )}
      >
        Add
      </Button>
    </div>
  );
};
