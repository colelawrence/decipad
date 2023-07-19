import { FC, useCallback, useContext, useEffect, useState } from 'react';
import {
  ExecutionContext,
  TExecution,
  useSQLConnectionStore,
} from '@decipad/react-contexts';
import { CodeEditor } from '@decipad/ui';
import { importFromUnknownJson } from '@decipad/import';
import { ConnectionProps } from './types';
import { fetchQuery } from '../utils';

export const SQLConnection: FC<ConnectionProps> = ({ setResultPreview }) => {
  const sqlStore = useSQLConnectionStore();

  const [log, setLog] = useState<TExecution<boolean>[]>([]);

  const { onExecute, info } = useContext(ExecutionContext);
  const runCode = useCallback(async () => {
    if (sqlStore.ExternalDataId) {
      const queryExec = await fetchQuery(
        sqlStore.ExternalDataId,
        sqlStore.Query
      );
      if (!queryExec) {
        // TODO: Handle Error
        return;
      }

      if (queryExec.type === 'success') {
        sqlStore.Set({ latestResult: JSON.stringify(queryExec.data) });
        setResultPreview(importFromUnknownJson(queryExec.data, {}));
        onExecute({ status: 'success', ok: true });
      } else {
        onExecute({ status: 'error', err: queryExec.message });
        setLog([{ status: 'error', err: queryExec.message }]);
      }
    } else {
      console.error('NO EXTERNAL DATA ID');
    }
  }, [onExecute, setResultPreview, sqlStore]);

  useEffect(() => {
    if (info.status === 'run') {
      onExecute({ status: 'unset' });
      setLog([{ status: 'run' }]);
      runCode();
    }
  }, [info.status, onExecute, runCode]);

  return (
    <CodeEditor
      code={sqlStore.Query}
      setCode={(code) => sqlStore.Set({ Query: code })}
      lang="sql"
      log={log}
      setLog={setLog}
    />
  );
};
