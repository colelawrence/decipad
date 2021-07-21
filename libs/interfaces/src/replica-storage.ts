import { ReplicationStatus } from './replication-status';

export interface ReplicaStorage extends Storage {
  setReplicationStatus: (
    key: string,
    replicationStatus: ReplicationStatus
  ) => void;

  stop: () => void;
}
