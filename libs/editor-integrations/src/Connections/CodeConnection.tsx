import { importFromUnknownJson, tableFlip } from '@decipad/import';
import {
  ExecutionContext,
  TExecution,
  useCodeConnectionStore,
  useComputer,
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
  const computer = useComputer();

  useEffect(() => {
    if (stage === 'connect') {
      onExecute({ status: 'unset' });
      setLog([]);
    }
  }, [onExecute, stage]);

  /**
   * We take the results from the computer
   * Do some restrictions on the type that can go through
   * And then we have an array of JS objects.
   */
  const deciVarDefs = computer.results$.useWithSelector((resObject) => {
    return Object.fromEntries(
      Object.values(resObject.blockResults)
        .map((r) => {
          if (r.type === 'identified-error') {
            return undefined;
          }

          switch (r.result.type.kind) {
            case 'string':
            case 'number':
            case 'boolean': {
              const varName = computer.getSymbolDefinedInBlock(r.id);
              if (!varName) return undefined;
              return [varName, r.result.value?.valueOf()] as const;
            }
          }
          return undefined;
        })
        .reduce((map, current) => {
          if (!current) return map;
          map.set(current[0], current[1]);
          return map;
        }, new Map<string, any>())
        .entries()
    );
  });

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
      worker?.execute(code, deciVarDefs);
    } catch (err) {
      console.error(err);
      setResultPreview(undefined);
      onExecute({ status: 'error', err: err as Error });
    }
  }, [worker, code, setResultPreview, onExecute, deciVarDefs]);

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
