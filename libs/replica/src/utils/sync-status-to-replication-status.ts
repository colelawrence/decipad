import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ReplicationStatus } from '@decipad/interfaces';
import { SyncStatus } from '../types';

const ignoredSyncStatuses = [
  SyncStatus.Errored,
  SyncStatus.RemoteChanged,
  SyncStatus.Reconciling,
];

export function syncStatusToReplicationStatus(
  syncStatus: Observable<SyncStatus>
): Observable<ReplicationStatus> {
  return syncStatus.pipe(
    filter(relevant),
    map((state: SyncStatus) =>
      state === SyncStatus.Reconciled || state === SyncStatus.RemoteChanged
        ? ReplicationStatus.SavedRemotely
        : ReplicationStatus.NeedsRemoteSave
    )
  );
}

function relevant(state: SyncStatus): boolean {
  return !ignoredSyncStatuses.includes(state);
}
