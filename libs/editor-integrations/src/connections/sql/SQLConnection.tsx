import type { FC } from 'react';
import { useExecutionContext, useResourceUsage } from '@decipad/react-contexts';
import type { ConnectionProps } from '../types';
import { useState } from 'react';
import { CodeEditor, OptionsList, TextAndIconButton } from '@decipad/ui';
import { ExternalProvider } from '@decipad/graphql-client';
import { Play } from 'libs/ui/src/icons';
import { useNavigate } from 'react-router-dom';
import { workspaces } from '@decipad/routing';
import { assertInstanceOf } from '@decipad/utils';
import { URLRunner } from '../../runners/types';
import { useWorkspaceConnections } from '../../hooks/useWorkspaceConnections';

const SQL: Array<ExternalProvider> = ['mysql', 'postgresql'];

export const SQLConnection: FC<ConnectionProps> = ({
  runner,
  workspaceId,
  externalData,
  setExternalData,
  onRun,
}) => {
  assertInstanceOf(runner, URLRunner);

  const nav = useNavigate();

  const conn = useWorkspaceConnections(workspaceId, SQL);
  const { queries } = useResourceUsage();
  const [query, setQuery] = useState(runner.getQuery());
  const { info, onExecute } = useExecutionContext();

  return (
    <div css={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div>
        <OptionsList
          name={externalData?.dataSourceName ?? undefined}
          label="Select SQL Connection"
          selections={conn.map((c) => ({
            ...c,
            name: c.dataSourceName ?? '',
          }))}
          onSelect={(c) => {
            runner.setUrl(c.dataUrl!);
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
      <CodeEditor
        code={query}
        setCode={(q) => {
          runner.setQuery(q);
          setQuery(q);
        }}
        lang="sql"
        log={info}
        setLog={onExecute}
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
    </div>
  );
};
