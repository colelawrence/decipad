import { FC, useCallback, useState } from 'react';
import { Remark } from 'react-remark';
import { css } from '@emotion/react';
import { z } from 'zod';
import { once } from '@decipad/utils';
import type { DataLakePossibleDataConnection } from '../DataLakeModal/ActiveDataLake';
import { Modal } from '../../../shared/molecules/Modal/Modal';
import { JSONSchemaForm } from '../../../shared/organisms/JSONSchemaForm/JSONSchemaForm';
import { Button } from '../../../shared/atoms/Button/Button';
import { cssVar } from '../../../primitives';
import { LoadingIndicator } from '../../../shared/templates/LoadingIndicator/LoadingIndicator';

export interface EditDataLakeConnectionProps {
  connection?: DataLakePossibleDataConnection;
  initialData?: object;
  closeAction: () => void;
  updateConnectionAction: (
    connection: DataLakePossibleDataConnection['sourceType'],
    config: unknown
  ) => Promise<void>;
  error?: string | null;
  state: 'error' | 'idle' | 'updating' | 'checking' | 'checked';
}

const getFormDataParser = once(() =>
  z.object({ formData: z.record(z.string(), z.any()) })
);

const getFormData = (data: unknown): object =>
  getFormDataParser().parse(data).formData;

const errorStyles = css({
  marginTop: '1rem',
  backgroundColor: cssVar('stateDangerBackground'),
  color: cssVar('stateDangerText'),
  padding: '1rem',
  borderRadius: '0.5rem',
});

export const DataLakeEditConnectionModal: FC<EditDataLakeConnectionProps> = ({
  connection,
  initialData,
  closeAction,
  updateConnectionAction,
  error,
  state,
}) => {
  const [formData, setFormData] = useState<object | undefined>(initialData);
  const onSubmit = useCallback(
    async (data: unknown) => {
      if (!connection) return;
      const newFormData = getFormData(data);
      setFormData(newFormData);
      return updateConnectionAction(connection.sourceType, newFormData);
    },
    [connection, updateConnectionAction]
  );
  return (
    <Modal
      title={`Edit ${connection?.displayName ?? ''} connection`}
      defaultOpen={true}
      onClose={closeAction}
    >
      {!connection ? (
        <LoadingIndicator />
      ) : (
        <>
          <Remark>{connection.configInstructionsMarkdown}</Remark>
          {error && <p css={errorStyles}>{error}</p>}
          <JSONSchemaForm
            schema={connection.configSchema}
            initialData={formData}
            onSubmit={onSubmit}
          >
            <Button disabled={state !== 'idle' && state !== 'error'} submit>
              {state === 'idle' || state === 'error'
                ? `Save and test ${connection.displayName} connection`
                : state === 'updating'
                ? `Updating ${connection.displayName} connection...`
                : state === 'checking'
                ? `Checking ${connection.displayName} connection...`
                : `Checked: Your ${connection.displayName} connection is working`}
            </Button>
          </JSONSchemaForm>
        </>
      )}
    </Modal>
  );
};
