/* eslint-disable no-param-reassign */
import type { FC } from 'react';
import { useResourceUsage } from '@decipad/react-contexts';
import type { ConnectionProps } from '../types';
import { useState } from 'react';
import {
  CodeEditor,
  ContentEditableInput,
  LiveCode,
  OptionsList,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  TextAndIconButton,
} from '@decipad/ui';
import { ExternalProvider } from '@decipad/graphql-client';
import { Play } from 'libs/ui/src/icons';
import { useNavigate } from 'react-router-dom';
import { workspaces } from '@decipad/routing';
import { assertInstanceOf } from '@decipad/utils';
import { useWorkspaceConnections } from '../../hooks/useWorkspaceConnections';
import styled from '@emotion/styled';
import { PortalledPreview } from '../ResultPreview';
import { css } from '@emotion/react';
import { SQLRunner, varIdentifierRegex } from '@decipad/notebook-tabs';

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
const AVAILABLE_TABS = [
  { id: 'code', label: 'Query' },
  { id: 'preview', label: 'Preview' },
] as const;

export const SQLConnection: FC<ConnectionProps> = (props) => {
  const { runner, onRun } = props;
  assertInstanceOf(runner, SQLRunner);

  const { queries } = useResourceUsage();
  const [query, setQuery] = useState(runner.options.runner.query ?? '');

  const [_, setVarIdentifiers] = useState<RegExpMatchArray[]>([]);

  return (
    <SQLConnectionWrapper>
      <TabsRoot defaultValue="code" styles={css({ display: 'contents' })}>
        <TabsList fullWidth>
          {AVAILABLE_TABS.map((tab) => {
            return (
              <TabsTrigger
                name={tab.id}
                key={tab.id}
                trigger={{ label: tab.label }}
              />
            );
          })}
        </TabsList>
        <TabsContent name="code">
          <CodeEditor
            code={query}
            setCode={(q) => {
              const identifiers = q.matchAll(varIdentifierRegex);
              setVarIdentifiers([...identifiers]);
              runner.setOptions({ runner: { query: q } });
              setQuery(q);
            }}
            lang="sql"
          />
          <TextAndIconButton
            text="Run"
            size="normal"
            iconPosition="left"
            color="brand"
            onClick={onRun}
            disabled={queries.hasReachedLimit}
          >
            <Play />
          </TextAndIconButton>
        </TabsContent>
        <TabsContent name="preview">
          <PortalledPreview
            {...props}
            varNameInput={
              props.type === 'create' && (
                <LiveCode type="table" meta={[]}>
                  <ContentEditableInput
                    value={props.varName}
                    onChange={props.onChangeVarName}
                  />
                </LiveCode>
              )
            }
          />
        </TabsContent>
      </TabsRoot>
    </SQLConnectionWrapper>
  );
};

const SQLConnectionWrapper = styled.div({
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  '[role=tabpanel]': {
    display: 'contents',
  },
});
