import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { DataLakeEditConnectionModal as DataLakeEditConnectionModalUI } from '@decipad/ui';
import { useToast } from '@decipad/toast';
import { useParams } from 'react-router-dom';
import { useDataLake } from '@decipad/editor-integrations';

interface DataLakeModalProps {
  closeAction: () => void;
  workspaceId: string;
  editedConnectionAction: (type: string) => unknown;
}

type ConnectionState = 'idle' | 'updating' | 'checking' | 'checked';

export const EditDataLakeConnectionModal: FC<DataLakeModalProps> = ({
  closeAction,
  workspaceId,
  editedConnectionAction,
}) => {
  const { connType } = useParams();
  const { dataLake, error, updateDataLakeConnection, checkConnection } =
    useDataLake(workspaceId);
  const [state, setState] = useState<ConnectionState>('idle');

  const conn = useMemo(() => {
    return dataLake?.connections?.find((c) => c.realm === connType);
  }, [dataLake, connType]);

  const toast = useToast();

  useEffect(() => {
    if (error) {
      console.error('error', error);
      toast.error(error.message ?? 'Unknown error');
    }
  }, [error, toast]);

  const updateConnectionAction = useCallback(
    async (type: string, config: unknown) => {
      setState('updating');
      await updateDataLakeConnection(type, config);
      setState('checking');
      await checkConnection(type);
      toast.success(`Connection to ${type} updated and successfully verified`);
      setState('checked');
      editedConnectionAction(type);
      setState('idle');
    },
    [updateDataLakeConnection, checkConnection, toast, editedConnectionAction]
  );

  return (
    <DataLakeEditConnectionModalUI
      connection={conn}
      initialData={conn?.config}
      closeAction={closeAction}
      state={error ? 'error' : state}
      error={error?.message}
      updateConnectionAction={updateConnectionAction}
    />
  );
};
