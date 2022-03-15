/* eslint-disable jsx-a11y/anchor-is-valid */
import { useMutation, useQuery } from '@apollo/client';
import { ClientEventsContext } from '@decipad/client-events';
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
  ImportPad,
  ImportPadVariables,
  IMPORT_PAD,
  RemovePad,
  RemovePadVariables,
  REMOVE_PAD,
} from '@decipad/queries';
import { useToast } from '@decipad/react-contexts';
import { Dashboard, NotebookList, NotebookListPlaceholder } from '@decipad/ui';
import { sortBy } from 'ramda';
import { FC, useCallback, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { SideMenu } from '../components/SideMenu';
import { Topbar } from '../components/Topbar';
import { encode as encodeVanityUrlComponent } from '../lib/vanityUrlComponent';

export function Workspace({
  workspaceId,
}: {
  workspaceId: string;
}): ReturnType<FC> {
  const history = useHistory();
  const toast = useToast();
  const clientEvent = useContext(ClientEventsContext);

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
  const [importPad] = useMutation<ImportPad, ImportPadVariables>(IMPORT_PAD, {
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
        toast('Notebook created successfully', 'success');
        history.push(`/n/${encodeVanityUrlComponent('', newPad.id)}`);
        clientEvent({ type: 'action', action: 'notebook created' });
      } catch (err) {
        toast(`Error creating notebook: ${(err as Error).message}`, 'error');
      } finally {
        setCreatingPad(false);
      }
    }
  }, [creatingPad, createPad, workspaceId, toast, history, clientEvent]);

  const handleDuplicateNotebook = (id: string) =>
    duplicatePad({
      variables: { id },
      refetchQueries: ['GetWorkspaceById'],
      awaitRefetchQueries: true,
    })
      .then(() => {
        toast('Notebook duplicated', 'info');
        clientEvent({ type: 'action', action: 'notebook duplicated' });
      })
      .catch((err) =>
        toast(`Error duplicating notebook: ${err.message}`, 'error')
      );

  const handleDeleteNotebook = (id: string) =>
    removePad({
      variables: { id },
      refetchQueries: ['GetWorkspaceById'],
      awaitRefetchQueries: true,
    })
      .then(() => {
        toast('Notebook removed', 'info');
        clientEvent({ type: 'action', action: 'notebook deleted' });
      })
      .catch((err) =>
        toast(`Error removing notebook: ${err.message}`, 'error')
      );

  const handleImportNotebook = (source: string) => {
    return importPad({
      variables: { workspaceId, source },
      refetchQueries: ['GetWorkspaceById'],
      awaitRefetchQueries: true,
    })
      .then(() => {
        toast('Notebook imported', 'info');
        clientEvent({ type: 'action', action: 'notebook deleted' });
      })
      .catch((err) => {
        toast(`Error importing notebook: ${err.message}`, 'error');
      });
  };

  return (
    <Dashboard
      topbar={
        <Topbar
          numberOfNotebooks={data?.getWorkspaceById?.pads.items.length || 0}
          onCreateNotebook={handleCreateNotebook}
        />
      }
      sidebar={<SideMenu workspaceId={workspaceId} />}
      notebookList={
        data ? (
          data.getWorkspaceById ? (
            <NotebookList
              Heading="h1"
              notebooks={sortBy(
                (item) => -Date.parse(item.createdAt),
                data.getWorkspaceById.pads.items
              ).map((notebook) => ({
                ...notebook,
                href: `/n/${encodeVanityUrlComponent(
                  notebook.name,
                  notebook.id
                )}`,
                exportHref: `/api/pads/${notebook.id}/export`,
                exportFileName: `notebook-${notebook.id}.json`,
              }))}
              onCreateNotebook={handleCreateNotebook}
              onDuplicate={handleDuplicateNotebook}
              onDelete={handleDeleteNotebook}
              onImport={handleImportNotebook}
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
