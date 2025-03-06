import { Button, Modal } from '../../../shared';
import { p12Regular } from '../../../primitives';
import { FC, useCallback, useState } from 'react';
import { DataLake, DataLakeProps } from './DataLake';
import { ErrorMessage } from '../../editor/ErrorMessage/ErrorMessage';

type DataLakeModalProps = {
  error?: Error;
  isLoading?: boolean;
  dataLake?: DataLakeProps['dataLake'];
  closeAction: () => void;
  createDataLakeAction: () => Promise<void>;
  newConnectionAction: (connection: string) => Promise<unknown>;
  editConnectionAction: (connection: string) => Promise<unknown>;
};

const CreateDataLake: FC<Pick<DataLakeModalProps, 'createDataLakeAction'>> = ({
  createDataLakeAction,
}) => {
  const [creating, setCreating] = useState(false);
  return (
    <div>
      <p css={p12Regular}>You don't have a data lake in this workspace.</p>
      <Button
        disabled={creating}
        onClick={useCallback(async () => {
          setCreating(true);
          try {
            await createDataLakeAction();
          } finally {
            setCreating(false);
          }
        }, [createDataLakeAction])}
      >
        {creating
          ? 'Creating a Data Lake for this workspace...'
          : 'Create Data Lake'}
      </Button>
    </div>
  );
};

export const DataLakeModal: React.FC<DataLakeModalProps> = ({
  error,
  isLoading,
  dataLake,
  closeAction,
  createDataLakeAction,
  newConnectionAction,
  editConnectionAction,
}) => {
  return (
    <Modal title="Data Lake settings" defaultOpen={true} onClose={closeAction}>
      <>
        {error && <ErrorMessage error={error} />}
        {dataLake && (
          <DataLake
            dataLake={dataLake}
            newConnectionAction={newConnectionAction}
            editConnectionAction={editConnectionAction}
          />
        )}
        {!dataLake && !isLoading && (
          <CreateDataLake createDataLakeAction={createDataLakeAction} />
        )}
      </>
    </Modal>
  );
};
