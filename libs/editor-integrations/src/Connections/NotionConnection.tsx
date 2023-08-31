import { FC, useCallback, useContext, useEffect } from 'react';
import { ConnectionProps } from './types';
import {
  ExecutionContext,
  useNotionConnectionStore,
} from '@decipad/react-contexts';
import { useNotionQuery } from '../hooks';
import { useRouteParams } from 'typesafe-routes/react-router';
import { notebooks } from '@decipad/routing';
import {
  columnTypeCoercionsToRec,
  importFromNotion,
  importFromUnknownJson,
} from '@decipad/import';
import { NotionConnection as UINotionConnection } from '@decipad/ui';

export const NotionConnection: FC<ConnectionProps> = ({
  setResultPreview,
  setRawResult,
  typeMapping,
}) => {
  const { NotionDatabaseUrl, Set } = useNotionConnectionStore((s) => ({
    NotionDatabaseUrl: s.NotionDatabaseUrl ?? '',
    Set: s.Set,
  }));

  const { notebook } = useRouteParams(notebooks({}).notebook);
  const { onExecute, info } = useContext(ExecutionContext);

  const execute = useNotionQuery(notebook.id, NotionDatabaseUrl);

  const runCode = useCallback(async () => {
    const res = await execute();
    if (!res.data?.getNotion) {
      onExecute({
        status: 'error',
        err: 'Could not find query or somthing',
      });
      return;
    }

    setRawResult(JSON.stringify(res.data.getNotion));

    const result = importFromUnknownJson(
      importFromNotion(JSON.parse(res.data.getNotion)),
      {
        columnTypeCoercions: columnTypeCoercionsToRec(typeMapping),
      }
    );

    Set({ latestResult: res.data.getNotion });
    setResultPreview(result);
    onExecute({ status: 'success', ok: true });
  }, [Set, execute, onExecute, setRawResult, setResultPreview, typeMapping]);

  useEffect(() => {
    if (info.status === 'run') {
      onExecute({ status: 'unset' });
      runCode();
    }
  }, [info.status, onExecute, runCode]);

  return (
    <UINotionConnection
      notionUrl={NotionDatabaseUrl}
      setNotionUrl={(n) => Set({ NotionDatabaseUrl: n })}
      status={
        info.status === 'error'
          ? info.err.toString()
          : info.status === 'success'
          ? 'Successfully imported!'
          : undefined
      }
    />
  );
};
