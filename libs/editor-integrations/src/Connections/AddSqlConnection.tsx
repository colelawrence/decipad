import { FC, useCallback, useMemo } from 'react';

import { useEditorChange } from '@decipad/editor-hooks';
import {
  ELEMENT_LIVE_CONNECTION,
  ImportElementSource,
  LiveDataSetElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { useComputer, useConnectionStore } from '@decipad/react-contexts';
import {
  DatabaseConnectionScreen,
  DatabaseQuery,
  Dialog,
  IntegrationModalDialog,
  WrapperIntegrationModalDialog,
} from '@decipad/ui';
import { css } from '@emotion/react';
import { findNode } from '@udecode/plate';
import { LiveQueryCore } from 'libs/editor-plugins/src/plugins/LiveQuery/components/LiveQueryCore';
import { useSession } from 'next-auth/react';
import { ProviderList } from '.';
import { useEditorElements } from '../hooks/useEditorElements';
import {
  addQueryToLiveDataSet,
  attemptConnection,
  fetchQuery,
  insertLiveDataSet,
} from '../utils';

// Note: Some of these names were not set, we might need to review this mapping
const providerTitle = {
  default: 'Integrations',
  gsheets: 'Google Sheets',
  mysql: 'MySQL',
  csv: 'CSV',
  json: 'Web API',
  mariadb: 'MariaDB',
  mongodb: 'MongoDB',
  mssql: 'MSSQL',
  redshift: 'Redshift',
  postgresql: 'Postgres',
  oracledb: 'Oracle',
  cockroachdb: 'Cockroach',
  decipad: 'Decipad',
  codeconnection: 'Code',
};

export const AddSqlIntegration: FC = () => {
  const liveResultWrapperStyles = css({
    width: '740px',
    maxHeight: '600px',
    overflow: 'scroll',
    paddingLeft: '32px',
    paddingRight: '32px',
  });

  const store = useConnectionStore();

  const editor = useTEditorRef();
  const computer = useComputer();
  const session = useSession();

  const liveConnections = useEditorElements(ELEMENT_LIVE_CONNECTION);

  const connectionTitle = useMemo(() => {
    return (
      store.connectionType
        ? providerTitle[store.connectionType] || providerTitle.default
        : providerTitle.default
    ).replace(' ', '');
  }, [store.connectionType]);

  // Handles creation of connection and queries as the user moves through
  // the dialog.
  const onConnectDb = useCallback(async () => {
    if (session.status !== 'authenticated') return;

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
      const liveConId = await insertLiveDataSet({
        computer,
        editor,
        source: store.connectionType as ImportElementSource,
        url: connectionString,
        connectionName: connectionTitle,
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

      store.setStage('map');

      addQueryToLiveDataSet(
        editor,
        store.dbOptions.existingConn.id,
        store.dbOptions.query
      );
    }
  }, [
    session.status,
    store,
    editor,
    computer,
    connectionTitle,
    liveConnections,
  ]);

  const currentQuery = useEditorChange(
    useCallback(() => {
      const node = findNode(editor, {
        at: [],
        match: { id: store.dbOptions.existingConn.id },
      });

      return node ? (node[0] as LiveDataSetElement).children[1] : undefined;
    }, [store, editor])
  );

  return (
    <>
      {store.open && (
        <Dialog open={store.open} setOpen={store.changeOpen}>
          <WrapperIntegrationModalDialog
            onContinue={onConnectDb}
            title={connectionTitle}
            showTabs={store.stage !== 'pick-integration'}
            tabStage={store.stage}
            onTabClick={store.setStage}
            onBack={store.abort}
            setOpen={store.changeOpen}
            secretsMenu={null}
          >
            {store.stage === 'pick-integration' ? (
              <IntegrationModalDialog
                onSelectSource={(provider) => {
                  if (provider) {
                    store.setConnectionType(provider as ImportElementSource);
                  } else {
                    store.setConnectionType(undefined);
                  }
                  store.setStage('connect');
                }}
                dataSources={ProviderList}
              />
            ) : store.stage === 'connect' ? (
              <DatabaseConnectionScreen workspaceId="hello" />
            ) : ['create-query', 'execute-query'].includes(store.stage) ? (
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
                connectionType={store.connectionType}
                onReconfigure={() => store.setStage('connect')}
              />
            ) : store.stage === 'map' && currentQuery ? (
              <div css={liveResultWrapperStyles}>
                <LiveQueryCore
                  element={currentQuery}
                  deleted={false}
                  showLiveQueryResults={true}
                ></LiveQueryCore>
              </div>
            ) : (
              <></>
            )}
          </WrapperIntegrationModalDialog>
        </Dialog>
      )}
    </>
  );
};
