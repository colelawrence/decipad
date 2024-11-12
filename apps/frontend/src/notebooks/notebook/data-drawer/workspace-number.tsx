import { formatResultPreview } from '@decipad/format';
import {
  useGetNotebookByIdQuery,
  WorkspaceNumber as GraphqlWorkspaceNumber,
  useUpsertWorkspaceNumberMutation,
} from '@decipad/graphql-client';
import { useResolved, useWindowListener } from '@decipad/react-utils';
import { useNotebookRoute } from '@decipad/routing';
import { useToast } from '@decipad/toast';
import { assert } from '@decipad/utils';
import { FC, useEffect, useMemo, useState } from 'react';
import {
  DataDrawerCodeWrapper,
  DataDrawerEditor,
  DataDrawerNameWrapper,
} from './styles';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import { decodeResult, decoders } from '@decipad/remote-computer-codec';

type WorkspaceNumberProps = {
  workspaceId: string;
  workspaceNumberId: string;
};

type DefinedWorkspaceNumberProps = WorkspaceNumberProps & {
  workspaceNumber: GraphqlWorkspaceNumber;
};

const DefinedWorkspaceNumber: FC<DefinedWorkspaceNumberProps> = ({
  workspaceId,
  workspaceNumber,
}) => {
  const [workspaceNumberName, setWorkspaceNumberName] = useState(
    workspaceNumber.name
  );

  useEffect(() => {
    setWorkspaceNumberName(workspaceNumber.name);
  }, [workspaceNumber.name]);

  const [, upsertWorkspaceNumber] = useUpsertWorkspaceNumberMutation();
  const toast = useToast();

  const closeDataDrawer = useNotebookWithIdState((s) => s.closeDataDrawer);

  const result = useResolved(
    useMemo(() => {
      const workspaceNumberBuffer = Buffer.from(
        workspaceNumber.encoding,
        'base64'
      );
      const dataView = new DataView(workspaceNumberBuffer.buffer);

      return decodeResult(dataView, 0, decoders).then(([res]) => res);
    }, [workspaceNumber.encoding])
  );

  const onSaveWorkspaceNumber = () => {
    if (workspaceNumberName.length === 0) {
      toast.warning('Workspace number must have a name.');
      return;
    }

    // TODO: Handle response.
    upsertWorkspaceNumber({
      workspaceId,
      workspaceNumber: {
        id: workspaceNumber.id,
        origin: workspaceNumber.origin,
        encoding: workspaceNumber.encoding,
        name: workspaceNumberName,
      },
    });
  };

  useWindowListener('keydown', (e) => {
    switch (e.key) {
      case 'Enter':
        onSaveWorkspaceNumber();
        break;
      case 'Escape':
        closeDataDrawer();
        break;
    }
  });

  if (result == null) {
    return null;
  }

  return (
    <DataDrawerEditor spellCheck={false} data-testid="data-drawer-wrapper">
      <DataDrawerNameWrapper>
        <div>
          <input
            value={workspaceNumberName}
            onChange={(e) => setWorkspaceNumberName(e.target.value)}
          />
        </div>
      </DataDrawerNameWrapper>
      <DataDrawerCodeWrapper>
        <div data-testid="data-drawer">{formatResultPreview(result)}</div>
      </DataDrawerCodeWrapper>
    </DataDrawerEditor>
  );
};

export const WorkspaceNumber: FC<WorkspaceNumberProps> = ({
  workspaceNumberId,
  workspaceId,
}) => {
  const { notebookId } = useNotebookRoute();

  const [{ data }] = useGetNotebookByIdQuery({ variables: { id: notebookId } });

  const workspaceNumbers = data?.getPadById?.workspace?.workspaceNumbers;

  if (workspaceNumbers == null) {
    return null;
  }

  const workspaceNumber = workspaceNumbers.find(
    (wsn) => wsn.id === workspaceNumberId
  );

  assert(
    workspaceNumber != null,
    'You must have a valid workspace number at this point.'
  );

  return (
    <DefinedWorkspaceNumber
      workspaceId={workspaceId}
      workspaceNumberId={workspaceNumberId}
      workspaceNumber={workspaceNumber}
    />
  );
};
