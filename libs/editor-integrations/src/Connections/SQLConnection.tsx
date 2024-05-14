import type { FC } from 'react';
import { useCallback, useContext, useEffect, useState } from 'react';
import type { TExecution } from '@decipad/react-contexts';
import {
  ExecutionContext,
  useSQLConnectionStore,
} from '@decipad/react-contexts';
import { CodeEditor } from '@decipad/ui';
import {
  columnTypeCoercionsToRec,
  importFromUnknownJson,
} from '@decipad/import';
import type { ConnectionProps } from './types';
import { fetchQuery } from '../utils';

export const SQLConnection: FC<ConnectionProps> = ({
  setRawResult,
  setResultPreview,
  typeMapping,
}) => {
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
        onExecute({ status: 'error', err: 'Something went wrong.' });
        setLog([{ status: 'error', err: 'Something went wrong.' }]);
        return;
      }

      if (queryExec.type === 'success') {
        importFromUnknownJson(queryExec.data, {
          columnTypeCoercions: columnTypeCoercionsToRec(typeMapping),
        }).then((res) => {
          setResultPreview(res);

          setRawResult(JSON.stringify(queryExec.data));
          onExecute({ status: 'success', ok: true });
        });
      } else {
        onExecute({ status: 'error', err: queryExec.message });
        setLog([{ status: 'error', err: queryExec.message }]);
      }
    } else {
      console.error('NO EXTERNAL DATA ID');
      onExecute({ status: 'error', err: 'No data connection selected.' });
      setLog([{ status: 'error', err: 'No data connection selected.' }]);
    }
  }, [onExecute, setRawResult, setResultPreview, sqlStore, typeMapping]);

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
