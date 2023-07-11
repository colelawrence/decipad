import { safeNumberForPrecision } from '@decipad/computer';
import { importFromUnknownJson, tableFlip } from '@decipad/import';
import DeciNumber from '@decipad/number';
import {
  ExecutionContext,
  TExecution,
  useCodeConnectionStore,
  useComputer,
  useConnectionStore,
} from '@decipad/react-contexts';
import type { ErrorMessageType, WorkerMessageType } from '@decipad_org/safejs';
import { FC, useCallback, useContext, useEffect, useState } from 'react';
import {
  Button,
  CodeEditor,
  InputField,
  Spinner,
  TextareaField,
  cssVar,
  setCssVar,
} from '@decipad/ui';
import {
  RemoteData,
  useRdFetch,
} from 'libs/editor-components/src/AIPanel/hooks';
import { css } from '@emotion/react';
import { useWorker } from '../hooks';
import { ConnectionProps } from './types';

const fieldsetStyles = css({
  display: 'grid',
  gridTemplateColumns: '1fr min-content',
  gridGap: 8,
  marginBottom: 20,
});

const fetchButtonStyles = css({
  backgroundColor: cssVar('aiSendButtonStrokeColor'),
  whiteSpace: 'nowrap',
  gridGap: 8,
  '&:disabled': {
    backgroundColor: cssVar('aiInsertButtonBgColor'),
    ...setCssVar('normalTextColor', cssVar('buttonPrimaryDisabledText')),
  },
});
const textAreaStyles = css({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  marginBottom: 20,
  textarea: {
    flex: 1,
  },
});

type AiPanelProps = {
  url: string;
  setUrl: (s: string) => void;
  exampleRes: string;
  setExampleRes: (s: string) => void;
  prompt: string;
  setPrompt: (s: string) => void;
  onSubmit: () => void;
  generationRD: RemoteData<any>;
};

const AiPanel = ({
  url,
  setUrl,
  exampleRes,
  setExampleRes,
  prompt,
  setPrompt,
  onSubmit,
  generationRD,
}: AiPanelProps) => {
  const [res, setRes] = useState<RemoteData<string>>({
    status: 'not asked',
  });

  const fetchRes = useCallback(() => {
    setRes({ status: 'loading' });

    fetch(url)
      .then(async (r) => {
        const result = await r.text();
        setRes({ status: 'success', result });
      })
      .catch(() => {
        setRes({
          status: 'error',
          error:
            'Failed to fetch example response. Either retry or enter data manually below.',
        });
      });
  }, [url, setRes]);

  useEffect(() => {
    if (res.status === 'success') {
      let { result } = res;
      // Attempt to format JSON if possible
      try {
        result = JSON.stringify(JSON.parse(result), null, 2);
      } catch (e) {
        // do nothing
      }
      setExampleRes(result);
    }
  }, [res, setExampleRes]);

  const loading = res.status === 'loading' || generationRD.status === 'loading';
  const createCodeButton = (
    <Button type="primary" styles={fetchButtonStyles} disabled={loading}>
      {generationRD.status === 'loading' ? (
        <>
          <Spinner />
          Generating
        </>
      ) : (
        'Create Code'
      )}
    </Button>
  );

  return (
    <>
      <form
        css={fieldsetStyles}
        onSubmit={(e) => {
          e.preventDefault();
          fetchRes();
        }}
      >
        <InputField
          label="API Endpoint URL"
          autoFocus
          type="url"
          small
          error={res.status === 'error' ? res.error : undefined}
          submitButton={
            <Button
              disabled={!url || loading}
              type="primary"
              styles={fetchButtonStyles}
            >
              Fetch Data
            </Button>
          }
          value={url}
          onChange={setUrl}
          disabled={loading}
        />
      </form>
      <TextareaField
        label="Example Response"
        value={exampleRes}
        onChange={setExampleRes}
        disabled={loading}
        styles={textAreaStyles}
      />
      <form
        css={fieldsetStyles}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <InputField
          label="Instructions"
          small
          type="text"
          value={prompt}
          onChange={setPrompt}
          disabled={loading}
          submitButton={createCodeButton}
          error={
            generationRD.status === 'error' ? generationRD.error : undefined
          }
        />
      </form>
    </>
  );
};

export const CodeConnection: FC<ConnectionProps> = (props) => {
  const { stage } = useConnectionStore();
  const { setCode, setLatestResult, code, showAi, toggleShowAi } =
    useCodeConnectionStore();
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
            case 'boolean': {
              const varName = computer.getSymbolDefinedInBlock(r.id);
              if (!varName) return undefined;
              return [varName, r.result.value?.valueOf()] as const;
            }
            case 'number': {
              const varName = computer.getSymbolDefinedInBlock(r.id);
              if (!varName) return undefined;
              const resVal = r.result.value as DeciNumber;
              if (!resVal) return undefined;
              const [, valOf] = safeNumberForPrecision(resVal);
              return [varName, valOf] as const;
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

  const [rd, fetchRd] = useRdFetch('/api/ai/generate-fetch-js');

  const [url, setUrl] = useState('');
  const [exampleRes, setExampleRes] = useState('');
  const [prompt, setPrompt] = useState('');
  useEffect(() => {
    switch (rd.status) {
      case 'error': {
        console.error(rd.error);
        return;
      }
      case 'loading': {
        return;
      }
      case 'not asked': {
        return;
      }
      case 'success': {
        toggleShowAi(false);
        setCode(rd.result?.completion?.replace(/\n {2}/g, '\n'));
      }
    }
  }, [rd, setCode, toggleShowAi]);

  return (
    <>
      {showAi ? (
        <AiPanel
          url={url}
          setUrl={setUrl}
          exampleRes={exampleRes}
          setExampleRes={setExampleRes}
          prompt={prompt}
          setPrompt={setPrompt}
          onSubmit={() => {
            fetchRd({
              url,
              exampleRes,
              prompt,
            });
          }}
          generationRD={rd}
        />
      ) : (
        <CodeEditor
          code={code}
          setCode={(sourcecode) => setCode(sourcecode)}
          log={log}
          setLog={setLog}
        />
      )}
    </>
  );
};
