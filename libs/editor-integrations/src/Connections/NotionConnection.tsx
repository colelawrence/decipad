import type { FC } from 'react';
import { Suspense, useEffect, useState } from 'react';
import { Computer } from '@decipad/computer-interfaces';
import {
  useComputer,
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
import { CaretDown, CaretUp } from 'libs/ui/src/icons';
import { merge } from '@decipad/utils';
import type { ConnectionProps } from './types';
import { getExternalDataReqUrl, getExternalDataUrl } from '../utils';

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
            {open ? <CaretUp /> : <CaretDown />}
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
        {notionConnections.map((conn) => (
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

const NotionPrivateDatabases: FC<ConnectionProps & { onRun: () => void }> = (
  props
) => {
  const externalDataId = useNotionConnectionStore((s) => s.ExternalDataId);

  if (externalDataId == null) {
    return null;
  }

  return <NotionPrivateDatabasesSelector {...props} />;
};

const NotionPrivateDatabasesSelector: FC<
  ConnectionProps & { onRun: () => void }
> = ({ onRun }) => {
  const [open, setOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [
    _externalDataId,
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

  if (_externalDataId == null) {
    throw new Error('Should be checked in parent component');
  }

  const externalDataId = _externalDataId;

  useEffect(() => {
    async function getDatabases() {
      setIsFetching(true);

      const notionDatabaseResponse = await fetch(
        getExternalDataReqUrl(externalDataId, 'getAllDatabases')
      );

      const notionDatabases = await notionDatabaseResponse.json();
      setter({
        AvailableDatabases: importDatabases(notionDatabases),
        lastFetchedDatabasesFor: externalDataId,
      });

      setIsFetching(false);
    }

    const hasFetchedForExternalData =
      lastFetched != null && lastFetched === externalDataId;

    if (!isFetching && !hasFetchedForExternalData) {
      getDatabases();
    }
  }, [setter, externalDataId, lastFetched, isFetching]);

  const getTriggerChildren = () => {
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
  };

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

          {open ? <CaretUp /> : <CaretDown />}
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
              NotionDatabaseUrl: getExternalDataUrl(externalDataId, {
                url: encodeURI(getNotionQueryDbLink(db.id)),
                method: 'POST',
              }),
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
  computer: Computer,
  notionResponse: Response,
  props: ConnectionProps
) {
  const notionResult = await notionResponse.json();

  const [importedNotion, cohersions] = importFromNotion(notionResult);
  const rawStringResult = JSON.stringify(notionResult);

  const mergedTypeMappings = merge(props.typeMapping, cohersions);

  importFromUnknownJson(computer, importedNotion, {
    columnTypeCoercions: columnTypeCoercionsToRec(mergedTypeMappings),
  }).then((deciRes) => {
    props.setRawResult(rawStringResult);
    props.setResultPreview(deciRes);
  });
}

async function runPrivateIntegration(
  computer: Computer,
  props: ConnectionProps
) {
  const url = useNotionConnectionStore.getState().NotionDatabaseUrl;
  if (url == null) {
    throw new Error('Cannot run private integration if DB URL is not set');
  }

  const notionQuery = await fetch(url);

  notionResponseToDeciResult(computer, notionQuery, props);
}

export const NotionConnection: FC<ConnectionProps> = (props) => {
  const { onExecute, info } = useExecutionContext();
  const computer = useComputer();

  const runCode = async () => {
    try {
      await runPrivateIntegration(computer, props);
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
