/* eslint-disable no-param-reassign */
import type { FC } from 'react';
import { useResourceUsage } from '@decipad/react-contexts';
import type { ConnectionProps } from '../types';
import { useState } from 'react';
import {
  CodeEditor,
  OptionsList,
  StatusLine,
  TextAndIconButton,
} from '@decipad/ui';
import { ExternalProvider } from '@decipad/graphql-client';
import { Play } from 'libs/ui/src/icons';
import { useNavigate } from 'react-router-dom';
import { workspaces } from '@decipad/routing';
import { assertInstanceOf } from '@decipad/utils';
import { useWorkspaceConnections } from '../../hooks/useWorkspaceConnections';
import styled from '@emotion/styled';
import { SplitPreview } from '../SplitPreview';
import { SQLRunner } from '@decipad/notebook-tabs';

const SQL: Array<ExternalProvider> = [
  'mysql',
  'postgresql',
  'bigquery',
  'cockroachdb',
  'oracledb',
  'mariadb',
  'mssql',
];

export const SQLConnectionPicker: FC<ConnectionProps> = ({
  externalData,
  setExternalData,
  workspaceId,
  runner,
}) => {
  assertInstanceOf(runner, SQLRunner);

  const conn = useWorkspaceConnections(workspaceId, SQL);
  const nav = useNavigate();

  return (
    <div>
      <OptionsList
        name={externalData?.dataSourceName ?? undefined}
        label="Select SQL Connection"
        selections={conn.map((c) => ({
          ...c,
          name: c.dataSourceName ?? '',
        }))}
        onSelect={(c) => {
          runner.setOptions({
            runner: { url: c.dataUrl!, provider: c.provider },
          });
          setExternalData(c);
        }}
        extraOption={{
          label: '+ SQL Connection',
          callback() {
            nav(
              workspaces({})
                .workspace({ workspaceId })
                .connections({})
                .sqlConnections({}).$
            );
          },
        }}
      />
    </div>
  );
};

export const SQLConnection: FC<ConnectionProps> = (props) => {
  const { runner, onRun } = props;
  assertInstanceOf(runner, SQLRunner);

  const { queries } = useResourceUsage();
  const [query, setQuery] = useState(runner.options.runner.query ?? '');

  return (
    <SQLConnectionWrapper>
      <SplitPreview conn={props}>
        <StyledHeader>
          <TextAndIconButton
            text="Run"
            size="fit"
            color="default"
            iconPosition="left"
            disabled={queries.hasReachedLimit}
            onClick={onRun}
          >
            <Play />
          </TextAndIconButton>
        </StyledHeader>
        <CodeEditor
          code={query}
          setCode={(q) => {
            runner.setOptions({ runner: { query: q } });
            setQuery(q);
          }}
          lang="sql"
        />
        <footer>
          <StatusLine type="javascript" logs={props.info} />
        </footer>
      </SplitPreview>
    </SQLConnectionWrapper>
  );
};

const SQLConnectionWrapper = styled.div({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  alignItems: 'end',
  position: 'relative',
  header: {
    position: 'absolute',
    top: '0',
    right: '0',
    zIndex: '100',
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'end',
  },
});

const StyledHeader = styled.header({
  padding: '8px',
});
