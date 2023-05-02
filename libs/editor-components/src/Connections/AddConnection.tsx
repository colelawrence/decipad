import { FC, useCallback, useMemo } from 'react';

import {
  DatabaseConnectionScreen,
  DatabaseQuery,
  Dialog,
  IntegrationModalDialog,
  WrapperIntegrationModalDialog,
} from '@decipad/ui';
import { ELEMENT_LIVE_CONNECTION, useTEditorRef } from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { getNodeString } from '@udecode/plate';
import { useSession } from 'next-auth/react';
import { ExternalProvider } from '@decipad/graphql-client';
import { useEditorElements } from '../hooks';
import { insertLiveConnection } from '../InteractiveParagraph';
import { insertLiveQueryBelow } from '../utils';
import {
  attemptConnection,
  fetchQuery,
  ProviderList,
  useConnectionStore,
} from '.';

export const AddConnection: FC = () => {
  const store = useConnectionStore();

  const editor = useTEditorRef();
  const computer = useComputer();
  const session = useSession();

  const liveConnections = useEditorElements(ELEMENT_LIVE_CONNECTION);

  const liveConnectionIDs: Array<[string, string]> = useMemo(
    () => liveConnections.map((v) => [v.id, getNodeString(v.children[0])]),
    [liveConnections]
  );

  // Handles creation of connection and queries as the user moves through
  // the dialog.
  const onConnectDb = useCallback(async () => {
    if (!session.data?.user?.id) return;

    if (store.stage === 'connect' && store.connectionType) {
      if (store.dbOptions.dbConnType === 'existing-conn') {
        const existingLiveCon = liveConnections.find(
          (l) => l.id === store.dbOptions.existingConn.id
        );

        if (!existingLiveCon) {
          store.setStates({
            connectionState: {
              type: 'error',
              message: 'Unable to find existing connection',
            },
          });
          return;
        }

        store.setExternalDataSource(existingLiveCon?.url);
        store.setStage('create-query');
        return;
      }

      // Creates an SQL connection string from credentials, or uses the one the user gave.
      const { username, password, host, port, database } = store.dbOptions;
      const connectionString =
        store.dbOptions.dbConnType === 'url'
          ? store.dbOptions.connectionString
          : `${store.connectionType}://${username}:${password}@${host}:${port}/${database}`;

      const externalDataId = await attemptConnection(
        {
          editorId: editor.id,
          url: connectionString,
          provider: store.connectionType,
        },
        computer
      );

      if (!externalDataId) {
        store.setStates({
          connectionState: {
            type: 'error',
            message:
              'Cannot connect to this database, check your connection details',
          },
        });
        return;
      }

      store.setExternalDataSource(externalDataId);
      const liveConId = await insertLiveConnection({
        computer,
        editor,
        source: store.connectionType,
        url: connectionString,
      });

      if (liveConId) {
        store.setStates({
          connectionState: {
            type: 'success',
            message: 'Connected successfully',
          },
        });
        store.setStage('create-query');
        store.setDbOptions({
          existingConn: { name: 'New connection', id: liveConId },
        });
      }
      return;
    }

    if (store.stage === 'create-query' && store.externalDataSource) {
      const queryState = await fetchQuery(
        store.externalDataSource,
        store.dbOptions.query
      );

      store.setStates({
        queryState,
      });

      // We don't want to create a live query if the query is wrong.
      if (queryState?.type !== 'success') return;

      insertLiveQueryBelow(
        editor,
        [0],
        computer.getAvailableIdentifier.bind(computer),
        store.dbOptions.existingConn.id,
        store.dbOptions.query
      );
    }
  }, [computer, editor, session.data?.user?.id, store, liveConnections]);

  return (
    <>
      {store.open && (
        <Dialog open={store.open} setOpen={store.changeOpen}>
          <WrapperIntegrationModalDialog
            onConnect={onConnectDb}
            isConnectShown={true}
            isConnectDisabled={false}
            title="Import Data"
            showTabs={store.stage !== 'pick-source'}
            tabStage={store.stage !== 'pick-source' ? store.stage : undefined}
            onTabClick={store.setStage}
            onAbort={store.abort}
          >
            {store.stage === 'pick-source' ? (
              <IntegrationModalDialog
                onSelectSource={(provider) => {
                  if (provider) {
                    store.setConnectionType(provider as ExternalProvider);
                  }
                  store.setStage('connect');
                }}
                dataSources={ProviderList}
              />
            ) : store.stage === 'connect' ? (
              <DatabaseConnectionScreen
                error={
                  store.states.connectionState?.type === 'error'
                    ? store.states.connectionState?.message
                    : undefined
                }
                existingConnections={liveConnectionIDs}
                values={store.dbOptions}
                setValues={store.setDbOptions}
              />
            ) : store.stage === 'create-query' ? (
              <DatabaseQuery
                connection={store.states.connectionState?.type}
                query={store.dbOptions.query}
                setQuery={(q) =>
                  store.setDbOptions({
                    query: q,
                  })
                }
                message={store.states.queryState?.message}
                state={store.states.queryState?.type}
              />
            ) : (
              <></>
            )}
          </WrapperIntegrationModalDialog>
        </Dialog>
      )}
    </>
  );
};
