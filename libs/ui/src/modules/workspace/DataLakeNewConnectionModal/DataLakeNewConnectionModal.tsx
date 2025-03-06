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

export interface NewDataLakeConnectionProps {
  connection?: DataLakePossibleDataConnection;
  closeAction: () => void;
  createNewConnectionAction: (
    connection: DataLakePossibleDataConnection['sourceType'],
    config: unknown
  ) => Promise<void>;
  error?: string | null;
  state: 'error' | 'idle' | 'creating' | 'checking' | 'checked';
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

const iconStyles = css({
  '& img': {
    width: '3rem',
    height: '3rem',
  },
});

export const DataLakeNewConnectionModal: FC<NewDataLakeConnectionProps> = ({
  connection,
  closeAction,
  createNewConnectionAction,
  error,
  state,
}) => {
  const [formData, setFormData] = useState<object | undefined>(undefined);
  const onSubmit = useCallback(
    async (data: unknown) => {
      if (!connection) return;
      const newFormData = getFormData(data);
      setFormData(newFormData);
      return createNewConnectionAction(connection.sourceType, newFormData);
    },
    [connection, createNewConnectionAction]
  );
  return (
    <Modal
      title={`Create new ${connection?.displayName ?? ''} connection`}
      defaultOpen={true}
      onClose={closeAction}
    >
      {!connection ? (
        <LoadingIndicator />
      ) : (
        <>
          <span css={iconStyles}>
            <img alt={connection.displayName} src={connection.icon} />
          </span>
          <Remark>{connection.configInstructionsMarkdown}</Remark>
          {error && <p css={errorStyles}>{error}</p>}
          <JSONSchemaForm
            schema={connection.configSchema}
            initialData={formData}
            onSubmit={onSubmit}
          >
            <Button disabled={state !== 'idle' && state !== 'error'} submit>
              {state === 'idle' || state === 'error'
                ? `Create ${connection.displayName} connection`
                : state === 'creating'
                ? `Creating ${connection.displayName} connection...`
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
