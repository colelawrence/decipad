import { FC, Suspense, useEffect, useState } from 'react';
import { ConnectionProps } from './types';
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
  Divider,
  InputField,
  LoadingIndicator,
  cssVar,
  p13Bold,
  p14Regular,
} from '@decipad/ui';
import * as Popover from '@radix-ui/react-popover';
import { useGetExternalDataSourcesWorkspaceQuery } from '@decipad/graphql-client';
import styled from '@emotion/styled';
import assert from 'assert';
import { getNotionDbLink } from '../utils';

const Styles = {
  OuterWrapper: styled.div({
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  }),

  Wrapper: styled.div({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
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

  ContentWrapper: styled.div({
    width: '240px',

    backgroundColor: cssVar('backgroundMain'),
    border: `1px solid ${cssVar('borderSubdued')}`,
    marginTop: '4px',
    borderRadius: '8px',
    display: 'flex',
    overflow: 'hidden',
    maxHeight: '320px',
    overflowY: 'auto',
    flexDirection: 'column',
    padding: '6px',
    gap: '4px',
    zIndex: 10000,
    svg: {
      width: '24px',
      height: '24px',
    },
    div: {
      cursor: 'pointer',
      ...p14Regular,
      textTransform: 'capitalize',
    },
  }),
};

const getNotionQueryDbLink = (databaseId: string) =>
  `https://api.notion.com/v1/databases/${databaseId}/query`;

const WorkspaceNotionConnections: FC<ConnectionProps> = ({ workspaceId }) => {
  const [open, setOpen] = useState(false);

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

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <Styles.Trigger>
          {externalDataName ?? 'Select Notion Connection...'}
        </Styles.Trigger>
      </Popover.Trigger>
      <Popover.Content>
        <Styles.ContentWrapper>
          {notionConnections.map((conn) => (
            <div
              key={conn.id}
              onClick={() =>
                setter({
                  ExternalDataId: conn.id,
                  ExternalDataName: conn.name,
                  mode: 'private',
                })
              }
            >
              {conn.name}
            </div>
          ))}
        </Styles.ContentWrapper>
      </Popover.Content>
    </Popover.Root>
  );
};

const NotionPrivateDatabases: FC<ConnectionProps> = () => {
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

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <Styles.Trigger>
          {isFetching
            ? 'Loading Databases...'
            : databaseName ?? 'Choose Database'}
        </Styles.Trigger>
      </Popover.Trigger>
      <Popover.Content>
        <Styles.ContentWrapper>
          {availableDatabases.map((db) => (
            <div
              key={db.id}
              onClick={() =>
                setter({
                  DatabaseId: db.id,
                  DatabaseName: db.name,
                  mode: 'private',
                })
              }
            >
              {db.name}
            </div>
          ))}
        </Styles.ContentWrapper>
      </Popover.Content>
    </Popover.Root>
  );
};

const NotionPublicDatabase: FC<ConnectionProps> = () => {
  const [notionDatabaseUrl, setter] = useNotionConnectionStore((s) => [
    s.NotionDatabaseUrl,
    s.Set,
  ]);

  return (
    <InputField
      type="text"
      value={notionDatabaseUrl ?? ''}
      placeholder="Database URL"
      onChange={(e) => setter({ NotionDatabaseUrl: e, mode: 'public' })}
    />
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
  const deciRes = importFromUnknownJson(importedNotion, {
    columnTypeCoercions: columnTypeCoercionsToRec(props.typeMapping),
  });

  props.setRawResult(rawStringResult);
  state.Set({ latestResult: rawStringResult });
  props.setResultPreview(deciRes);
}

async function runPrivateIntegration(props: ConnectionProps) {
  const state = useNotionConnectionStore.getState();
  assert(state.mode === 'private');

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
async function runPublicIntegration(props: ConnectionProps) {
  const state = useNotionConnectionStore.getState();
  assert(state.mode === 'public');

  if (state.NotionDatabaseUrl == null) {
    throw new Error('Database URL is invalid');
  }

  const id = getNotionDbLink(state.NotionDatabaseUrl);
  if (id == null) {
    throw new Error('Database URL is invalid');
  }

  const publicNotionQuery = await fetch(
    `${window.location.origin}/api/externaldatasources/notion/${id}/data`
  );

  notionResponseToDeciResult(publicNotionQuery, props);
}

export const NotionConnection: FC<ConnectionProps> = (props) => {
  const { onExecute, info } = useExecutionContext();

  const runCode = async () => {
    const state = useNotionConnectionStore.getState();

    try {
      if (state.mode === 'public') {
        await runPublicIntegration(props);
      } else if (state.mode === 'private') {
        await runPrivateIntegration(props);
      } else {
        onExecute({ status: 'error', err: 'You must fill in the fields' });
      }
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
        <p css={p13Bold}>
          Connect a Notion Database from a Workspace Connection.
        </p>
        <Suspense fallback={<LoadingIndicator />}>
          <WorkspaceNotionConnections {...props} />
        </Suspense>
        <NotionPrivateDatabases {...props} />
      </Styles.Wrapper>

      <Divider />

      <Styles.Wrapper>
        <p css={p13Bold}>Or connect to a Public Notion Database.</p>
        <NotionPublicDatabase {...props} />
      </Styles.Wrapper>
    </Styles.OuterWrapper>
  );
};
