/* eslint-disable decipad/css-prop-named-variable */
import { FC } from 'react';
import { h2, p12Bold, p12Regular } from '../../../primitives/text';
import type { DataLakeDataConnection } from './ActiveDataLake';
import { cssVar } from 'libs/ui/src/primitives';
import { css, CSSObject } from '@emotion/react';
import { Button } from '../../../shared';
import { ConnectionSyncStatus } from './ConnectionSyncStatus';

export interface DataLakeConnectionProps {
  connection: DataLakeDataConnection;
  editAction: () => void;
}

const connectionStateColors: Record<
  DataLakeDataConnection['state'],
  CSSObject
> = {
  pending: css({
    backgroundColor: cssVar('stateWarningBackground'),
    color: cssVar('stateWarningText'),
  }),
  ready: css({
    backgroundColor: cssVar('stateNeutralBackground'),
    color: cssVar('stateNeutralText'),
  }),
  inactive: css({
    backgroundColor: cssVar('stateWarningBackground'),
    color: cssVar('stateWarningText'),
  }),
};

const dataLakeConnectionStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const iconStyles = css({
  width: '24px',
  height: '24px',
});

export const DataLakeConnection: FC<DataLakeConnectionProps> = ({
  connection,
  editAction,
}) => {
  return (
    <div css={dataLakeConnectionStyles}>
      <img css={iconStyles} alt={connection.source} src={connection.icon} />
      <h3 css={h2}>{connection.source}</h3>
      <h2 css={p12Bold}>{connection.realm}</h2>
      <p css={[p12Regular, connectionStateColors[connection.state]]}>
        {connection.state}
      </p>
      {connection.syncStatus && (
        <ConnectionSyncStatus {...connection.syncStatus} />
      )}
      <Button onClick={editAction}>Edit</Button>
    </div>
  );
};
