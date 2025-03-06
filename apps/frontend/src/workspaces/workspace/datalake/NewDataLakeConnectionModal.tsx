import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { DataLakeNewConnectionModal as DataLakeNewConnectionModalUI } from '@decipad/ui';
import { useToast } from '@decipad/toast';
import { useParams } from 'react-router-dom';
import { timeout } from '@decipad/utils';
import { useDataLake } from '@decipad/editor-integrations';

interface DataLakeModalProps {
  closeAction: () => void;
  workspaceId: string;
  createdNewConnectionAction: (type: string) => unknown;
}

type ConnectionState = 'idle' | 'error' | 'creating' | 'checking' | 'checked';

export const NewDataLakeConnectionModal: FC<DataLakeModalProps> = ({
  closeAction,
  workspaceId,
  createdNewConnectionAction,
}) => {
  const { connType } = useParams();
  const { dataLake, error, createDataLakeConnection, checkConnection } =
    useDataLake(workspaceId);
  const [state, setState] = useState<ConnectionState>('idle');

  const conn = useMemo(() => {
    return dataLake?.availableConnections.find(
      (c) => c.sourceType === connType
    );
  }, [dataLake, connType]);

  const toast = useToast();

  useEffect(() => {
    if (error) {
      console.error('error', error);
      toast.error(error.message ?? 'Unknown error');
    }
  }, [error, toast]);

  const createNewConnectionAction = useCallback(
    async (type: string, config: unknown) => {
      setState('creating');
      await createDataLakeConnection(type, config);
      setState('checking');
      await timeout(1000);
      await checkConnection(type);
      toast.success(`Connection to ${type} created and successfully verified`);
      setState('checked');
      createdNewConnectionAction(type);
      setState('idle');
    },
    [
      checkConnection,
      createDataLakeConnection,
      createdNewConnectionAction,
      toast,
    ]
  );

  return (
    <DataLakeNewConnectionModalUI
      connection={conn}
      closeAction={closeAction}
      state={error ? 'error' : state}
      error={error?.message}
      createNewConnectionAction={createNewConnectionAction}
    />
  );
};
