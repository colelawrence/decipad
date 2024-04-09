import type { FC } from 'react';
import { Suspense, useEffect, useState } from 'react';
import type { ConnectionProps } from './types';
import {
  useExecutionContext,
  useNotionConnectionStore,
} from '@decipad/react-contexts';
import {
  columnTypeCoercionsToRec,
  importDatabases,
  importFromNotion,
  importFromUnknownJson,
} from '@decipad/import';
import {
  LoadingIndicator,
  MenuItem,
  MenuList,
  cssVar,
  p13Bold,
} from '@decipad/ui';
import { useGetExternalDataSourcesWorkspaceQuery } from '@decipad/graphql-client';
import styled from '@emotion/styled';
import { Link, useNavigate } from 'react-router-dom';
import { workspaces } from '@decipad/routing';
import { Caret } from 'libs/ui/src/icons';

const Styles = {
  OuterWrapper: styled.div({
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  }),

  Wrapper: styled.div({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }),

  Trigger: styled.div({
    display: 'flex',
    justifyContent: 'space-between',
    borderRadius: '6px',
    height: '32px',
    border: `1px solid ${cssVar('borderSubdued')}`,
    padding: '8px',
    svg: { width: '16px', height: '16px' },
  }),

  Link: styled.span({
    ':hover': {
      textDecoration: 'underline',
    },
  }),
};

const getNotionQueryDbLink = (databaseId: string) =>
  `https://api.notion.com/v1/databases/${databaseId}/query`;

const WorkspaceNotionConnections: FC<ConnectionProps> = ({ workspaceId }) => {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  const reset = useNotionConnectionStore((s) => s.Reset);

  const navigateToIntegrations = () => {
    reset();
    setTimeout(() => {
      nav(
        workspaces({})
          .workspace({ workspaceId })
          .connections({})
          .integrations({}).$
      );
    }, 0);
  };

  const [{ data }] = useGetExternalDataSourcesWorkspaceQuery({
    variables: {
      workspaceId,
    },
  });

  const [externalDataName, setter] = useNotionConnectionStore((s) => [
    s.ExternalDataName,
    s.Set,
  ]);

  const notionConnections =
    data?.getExternalDataSourcesWorkspace.filter(
      (conn) => conn.provider === 'notion'
    ) ?? [];

  if (notionConnections.length === 0) {
    return (
      <Link
        to={
          workspaces({})
            .workspace({ workspaceId })
            .connections({})
            .integrations({}).$
        }
      >
        <Styles.Link>No Notion Connections. Click to create one.</Styles.Link>
      </Link>
    );
  }

  return (
    <>
      <p css={p13Bold}>
        Connect a Notion Database from a Workspace Connection.
      </p>
      <MenuList
        root
        dropdown
        open={open}
        onChangeOpen={setOpen}
        trigger={
          <Styles.Trigger>
            {externalDataName ?? 'Select Notion Connection...'}
            <Caret variant={open ? 'up' : 'down'} />
          </Styles.Trigger>
        }
      >
        <MenuItem
          key="add-new"
          css={{ minWidth: '240px' }}
          onSelect={navigateToIntegrations}
        >
          + Add new connection
        </MenuItem>
        {notionConnections
          .filter((c) => c.name !== 'TEMP_CONNECTION')
          .map((conn) => (
            <MenuItem
              css={{ minWidth: '240px' }}
              key={conn.id}
              onSelect={() =>
                setter({
                  ExternalDataId: conn.id,
                  ExternalDataName: conn.name,
                })
              }
            >
              {conn.name}
            </MenuItem>
          ))}
      </MenuList>
    </>
  );
};

const NotionPrivateDatabases: FC<ConnectionProps & { onRun: () => void }> = ({
  onRun,
}) => {
  const [open, setOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [
    externalDataId,
    databaseName,
    availableDatabases,
    lastFetched,
    setter,
  ] = useNotionConnectionStore((s) => [
    s.ExternalDataId,
    s.DatabaseName,
    s.AvailableDatabases,
    s.lastFetchedDatabasesFor,
    s.Set,
  ]);

  useEffect(() => {
    async function getDatabases() {
      setIsFetching(true);

      const myFetch = await fetch(
        `${window.location.origin}/api/externaldatasources/${externalDataId}/data?url=getAllDatabases`
      );

      const jsonRes = await myFetch.json();
      setter({
        AvailableDatabases: importDatabases(jsonRes),
        lastFetchedDatabasesFor: externalDataId,
      });

      setIsFetching(false);
    }

    if (externalDataId == null) {
      return;
    }

    const hasFetchedForExternalData =
      lastFetched != null && lastFetched === externalDataId;

    if (!isFetching && !hasFetchedForExternalData) {
      getDatabases();
    }
  }, [setter, externalDataId, lastFetched, isFetching]);

  function getTriggerChildren() {
    if (isFetching) {
      return <LoadingIndicator />;
    }

    if (databaseName == null) {
      return 'Select Database';
    }

    if (databaseName != null && databaseName.length === 0) {
      return 'Unnamed Database';
    }

    return databaseName;
  }

  if (externalDataId == null) {
    return null;
  }

  if (availableDatabases.length === 0 && !isFetching) {
    return <p>No databases found.</p>;
  }

  return (
    <MenuList
      root
      dropdown
      open={open}
      onChangeOpen={(o) => {
        if (isFetching) return;
        setOpen(o);
      }}
      trigger={
        <Styles.Trigger>
          {getTriggerChildren()}

          <Caret variant={open ? 'up' : 'down'} />
        </Styles.Trigger>
      }
    >
      {availableDatabases.map((db) => (
        <MenuItem
          key={db.id}
          css={{ minWidth: '240px' }}
          onSelect={() => {
            setter({
              DatabaseId: db.id,
              DatabaseName: db.name,
            });
            onRun();
          }}
        >
          {db.name.length > 0 ? db.name : 'Unnamed Database'}
        </MenuItem>
      ))}
    </MenuList>
  );
};

async function notionResponseToDeciResult(
  notionResponse: Response,
  props: ConnectionProps
) {
  const state = useNotionConnectionStore.getState();
  const notionResult = await notionResponse.json();

  const importedNotion = importFromNotion(notionResult);
  const rawStringResult = JSON.stringify(notionResult);
  importFromUnknownJson(importedNotion, {
    columnTypeCoercions: columnTypeCoercionsToRec(props.typeMapping),
  }).then((deciRes) => {
    props.setRawResult(rawStringResult);
    state.Set({ latestResult: rawStringResult });
    props.setResultPreview(deciRes);
  });
}

async function runPrivateIntegration(props: ConnectionProps) {
  const state = useNotionConnectionStore.getState();

  if (state.ExternalDataId == null || state.DatabaseId == null) {
    throw new Error('You must select a data source and a database');
  }

  const notionQuery = await fetch(
    `${window.location.origin}/api/externaldatasources/${
      state.ExternalDataId
    }/data?url=${getNotionQueryDbLink(state.DatabaseId)}&method=POST`
  );

  notionResponseToDeciResult(notionQuery, props);
}

export const NotionConnection: FC<ConnectionProps> = (props) => {
  const { onExecute, info } = useExecutionContext();

  const runCode = async () => {
    try {
      await runPrivateIntegration(props);
    } catch (e) {
      if (e instanceof Error) {
        onExecute({ status: 'error', err: e });
      } else {
        throw e;
      }
    }
  };

  useEffect(() => {
    if (info.status === 'run') {
      onExecute({ status: 'unset' });
      runCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info.status, onExecute]);

  return (
    <Styles.OuterWrapper>
      <Styles.Wrapper>
        <Suspense>
          <WorkspaceNotionConnections {...props} />
          <NotionPrivateDatabases {...props} onRun={() => runCode()} />
        </Suspense>
      </Styles.Wrapper>
    </Styles.OuterWrapper>
  );
};
