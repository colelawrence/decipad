import { importFromUnknownJson, tableFlip } from '@decipad/import';
import {
  ExecutionContext,
  TExecution,
  useCodeConnectionStore,
  useConnectionStore,
} from '@decipad/react-contexts';
import { CodeEditor } from '@decipad/ui';
import type { ErrorMessageType, WorkerMessageType } from '@decipad_org/safejs';
import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { useWorker } from '../hooks';
import { ConnectionProps } from './types';

export const CodeConnection: FC<ConnectionProps> = (props) => {
  const { stage } = useConnectionStore();
  const { setCode, setLatestResult, code } = useCodeConnectionStore();
  const { onExecute, info } = useContext(ExecutionContext);
  const [log, setLog] = useState<TExecution<boolean>[]>(
    [] as TExecution<boolean>[]
  );
  const { setResultPreview } = props;

  useEffect(() => {
    if (stage === 'connect') {
      onExecute({ status: 'unset' });
      setLog([]);
    }
  }, [onExecute, stage]);

  const msgStream = useCallback(
    (msg: WorkerMessageType) => {
      const logsFromWorker = msg.logs.map((logLine: string) => ({
        status: 'log',
        log: logLine,
      })) as TExecution<boolean>[];

      if (logsFromWorker.length > 0) {
        logsFromWorker.forEach((logLine) =>
          setTimeout(() => onExecute(logLine), 0)
        );
      }

      // error
      if (typeof msg.result !== 'string') {
        onExecute({ status: 'error', err: msg.result });
        return;
      }

      setLatestResult(msg.result);
      try {
        let jsonMsg = JSON.parse(msg.result);
        if (jsonMsg == null) {
          setResultPreview(undefined);
          return onExecute({ status: 'warning', err: 'No value returned' });
        }

        if (
          typeof jsonMsg === 'object' &&
          Array.isArray(jsonMsg) &&
          jsonMsg.length > 0 &&
          typeof jsonMsg[0] === 'object'
        ) {
          jsonMsg = tableFlip(jsonMsg);
        }

        const res = importFromUnknownJson(jsonMsg, {});
        setResultPreview(res);

        onExecute({ status: 'success', ok: true });
      } catch (err) {
        setResultPreview(undefined);
        console.error(err);
        onExecute({
          status: 'error',
          err: err as Error,
        });
      }
    },
    [onExecute, setLatestResult, setResultPreview]
  );

  const errorStream = useCallback(
    (msg: ErrorMessageType) => {
      // Print the logs
      for (const workerLog of msg.logs) {
        onExecute({ status: 'log', log: workerLog });
      }
      setResultPreview(undefined);
      onExecute({ status: 'error', err: msg.result });
    },
    [onExecute, setResultPreview]
  );

  const worker = useWorker(msgStream, errorStream);

  const runCode = useCallback(() => {
    try {
      worker?.execute(code);
    } catch (err) {
      console.error(err);
      setResultPreview(undefined);
      onExecute({ status: 'error', err: err as Error });
    }
  }, [worker, code, setResultPreview, onExecute]);

  useEffect(() => {
    if (info.status === 'run') {
      onExecute({ status: 'unset' });
      setLog([{ status: 'run' }]);
      runCode();
    }
  }, [info.status, onExecute, runCode]);

  return (
    <CodeEditor
      code={code}
      setCode={(sourcecode) => setCode(sourcecode)}
      log={log}
      setLog={setLog}
    />
  );
};
