import { FC, useMemo } from 'react';
import type { DataLakeDataConnection } from './ActiveDataLake';
import { p10Regular } from '../../../primitives/text';
import { Tooltip } from '../../../shared/atoms/Tooltip/Tooltip';
import { css } from '@emotion/react';
import { TimeAgo } from '@decipad/react-utils';

const tooltipContentStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const errorMessageStyles = css([
  p10Regular,
  {
    color: 'white',
  },
]);

export const ConnectionSyncStatus: FC<
  NonNullable<DataLakeDataConnection['syncStatus']>
> = (syncStatus) => {
  const lastSyncDate = useMemo(
    () =>
      syncStatus.lastSyncStartedAt != null &&
      new Date(syncStatus.lastSyncStartedAt * 1000),
    [syncStatus]
  );
  const failedAtDate = useMemo(
    () => syncStatus.failure && new Date(syncStatus.failure.failedAt * 1000),
    [syncStatus]
  );
  return (
    <Tooltip trigger={<p css={p10Regular}>sync is {syncStatus.status}</p>}>
      <div css={tooltipContentStyles}>
        <p>Status: {syncStatus.status}</p>
        {lastSyncDate && (
          <p>
            Latest attempt: started <TimeAgo timestamp={lastSyncDate} />
          </p>
        )}
        {syncStatus.failure && (
          <>
            {failedAtDate && (
              <p>
                Failed <TimeAgo timestamp={failedAtDate} />
              </p>
            )}
            <p>Failure from {syncStatus.failure.failureOrigin}:</p>
            <p css={errorMessageStyles}>{syncStatus.failure.message}</p>
          </>
        )}
      </div>
    </Tooltip>
  );
};
