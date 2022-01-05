/* eslint-disable jsx-a11y/anchor-is-valid */
import { useMutation, useQuery } from '@apollo/client';
import {
  CountPadsVariables,
  COUNT_PADS,
  CreatePad,
  CreatePadVariables,
  CREATE_PAD,
  DuplicatePad,
  DuplicatePadVariables,
  DUPLICATE_PAD,
  GetPadsVariables,
  GetWorkspaceById,
  GetWorkspaceByIdVariables,
  GET_PADS,
  GET_WORKSPACES,
  GET_WORKSPACE_BY_ID,
  RemovePad,
  RemovePadVariables,
  REMOVE_PAD,
} from '@decipad/queries';
import { Dashboard, NotebookList, NotebookListPlaceholder } from '@decipad/ui';
import { FC, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { SideMenu } from '../components/SideMenu';
import { Topbar } from '../components/Topbar';
import { encode as encodeVanityUrlComponent } from '../lib/vanityUrlComponent';

export function Workspace({
  workspaceId,
}: {
  workspaceId: string;
}): ReturnType<FC> {
  const history = useHistory();

  const { addToast } = useToasts();

  const { data } = useQuery<GetWorkspaceById, GetWorkspaceByIdVariables>(
    GET_WORKSPACE_BY_ID,
    {
      variables: { id: workspaceId },
      fetchPolicy: 'network-only',
    }
  );

  const [removePad] = useMutation<RemovePad, RemovePadVariables>(REMOVE_PAD);
  const [duplicatePad] =
    useMutation<DuplicatePad, DuplicatePadVariables>(DUPLICATE_PAD);
  const [createPad] = useMutation<CreatePad, CreatePadVariables>(CREATE_PAD, {
    refetchQueries: [
      { query: GET_WORKSPACES },
      { query: COUNT_PADS, variables: { workspaceId } as CountPadsVariables },
      { query: GET_PADS, variables: { workspaceId } as GetPadsVariables },
    ],
  });

  const [creatingPad, setCreatingPad] = useState(false);
  const handleCreateNotebook = useCallback(async () => {
    if (!creatingPad) {
      setCreatingPad(true);
      try {
        const { data: creation } = await createPad({
          variables: {
            workspaceId,
            name: '',
          },
        });
        if (!creation) {
          throw new Error('No notebook creation result');
        }
        const newPad = creation.createPad;
        addToast('Notebook created successfully', { appearance: 'success' });
        history.push(
          `/workspaces/${workspaceId}/pads/${encodeVanityUrlComponent(
            '',
            newPad.id
          )}`
        );
      } catch (err) {
        addToast(`Error creating notebook: ${(err as Error).message}`, {
          appearance: 'error',
        });
      } finally {
        setCreatingPad(false);
      }
    }
  }, [creatingPad, createPad, workspaceId, addToast, history]);
  const handleDuplicateNotebook = (id: string) =>
    duplicatePad({
      variables: { id },
      refetchQueries: ['GetWorkspaceById'],
      awaitRefetchQueries: true,
    })
      .then(() => addToast('Notebook duplicated', { appearance: 'info' }))
      .catch((err) =>
        addToast(`Error duplicating notebook: ${err.message}`, {
          appearance: 'error',
        })
      );
  const handleDeleteNotebook = (id: string) =>
    removePad({
      variables: { id },
      refetchQueries: ['GetWorkspaceById'],
      awaitRefetchQueries: true,
    })
      .then(() => addToast('Notebook removed', { appearance: 'info' }))
      .catch((err) =>
        addToast(`Error removing notebook: ${err.message}`, {
          appearance: 'error',
        })
      );

  return (
    <Dashboard
      topbar={
        <Topbar
          workspaceId={workspaceId}
          onCreateNotebook={handleCreateNotebook}
        />
      }
      sidebar={<SideMenu workspaceId={workspaceId} />}
      notebookList={
        data ? (
          data.getWorkspaceById ? (
            <NotebookList
              Heading="h1"
              notebooks={data.getWorkspaceById.pads.items.map((notebook) => ({
                ...notebook,
                href: `/workspaces/${
                  // checked a couple lines earlier
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  data.getWorkspaceById!.id
                }/pads/${encodeVanityUrlComponent(notebook.name, notebook.id)}`,
                exportHref: `/api/pads/${notebook.id}/export`,
                exportFileName: `notebook-${notebook.id}.json`,
              }))}
              onCreateNotebook={handleCreateNotebook}
              onDuplicate={handleDuplicateNotebook}
              onDelete={handleDeleteNotebook}
            />
          ) : (
            'Workspace not found'
          )
        ) : (
          <NotebookListPlaceholder />
        )
      }
    />
  );
}
