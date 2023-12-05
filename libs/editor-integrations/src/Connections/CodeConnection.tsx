import {
  columnTypeCoercionsToRec,
  importFromUnknownJson,
  tableFlip,
} from '@decipad/import';
import {
  ExecutionContext,
  TExecution,
  useCodeConnectionStore,
  useConnectionStore,
  useCurrentWorkspaceStore,
  useNotebookId,
} from '@decipad/react-contexts';
import type { ErrorMessageType, WorkerMessageType } from '@decipad/safejs';
import { FC, useCallback, useContext, useEffect, useState } from 'react';
import {
  Button,
  CodeEditor,
  InputField,
  Spinner,
  TextareaField,
  componentCssVars,
  cssVar,
} from '@decipad/ui';
import { useIncrementQueryCountMutation } from '@decipad/graphql-client';
import { css } from '@emotion/react';
import {
  RemoteData,
  useRdFetch,
} from 'libs/editor-components/src/AIPanel/hooks';
import { useDeciVariables } from '../hooks';
import { ConnectionProps } from './types';
import { useWorker } from '@decipad/editor-hooks';

const fieldsetStyles = css({
  display: 'grid',
  gridTemplateColumns: '1fr min-content',
  gridGap: 8,
  marginBottom: 20,
});

const fetchButtonStyles = css({
  backgroundColor: componentCssVars('AiSendButtonStrokeColor'),
  whiteSpace: 'nowrap',
  gridGap: 8,
  '&:disabled': {
    backgroundColor: cssVar('backgroundDefault'),
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
  maxQueryExecution: boolean;
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
  maxQueryExecution,
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
    <Button
      type="primary"
      styles={fetchButtonStyles}
      disabled={loading || maxQueryExecution}
    >
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
          size="small"
          error={res.status === 'error' ? res.error : undefined}
          submitButton={
            <Button
              disabled={!url || loading || maxQueryExecution}
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
          size="small"
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

export const CodeConnection: FC<ConnectionProps> = ({
  setResultPreview,
  typeMapping,
}) => {
  const { stage, setRawResult } = useConnectionStore();

  const { setCode, setLatestResult, code, showAi, toggleShowAi, onReset } =
    useCodeConnectionStore();

  const { onExecute, info } = useContext(ExecutionContext);
  const [log, setLog] = useState<TExecution<boolean>[]>(
    [] as TExecution<boolean>[]
  );
  const { workspaceInfo, setCurrentWorkspaceInfo } = useCurrentWorkspaceStore();
  const { quotaLimit, queryCount, id } = workspaceInfo;
  const [, updateQueryExecCount] = useIncrementQueryCountMutation();
  const [maxQueryExecution, setMaxQueryExecution] = useState(false);
  const updateQueryExecutionCount = useCallback(async () => {
    return updateQueryExecCount({
      id: id || '',
    });
  }, [id, updateQueryExecCount]);

  useEffect(() => {
    if (stage === 'connect') {
      onExecute({ status: 'unset' });
      setLog([]);
    }
  }, [onExecute, stage]);

  useEffect(() => {
    setMaxQueryExecution(
      !!quotaLimit && !!queryCount && quotaLimit <= queryCount
    );
  }, [quotaLimit, queryCount]);

  const deciVariables = useDeciVariables();

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

      setRawResult(msg.result);
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

        const res = importFromUnknownJson(jsonMsg, {
          columnTypeCoercions: columnTypeCoercionsToRec(typeMapping),
        });
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
    [onExecute, setLatestResult, setRawResult, setResultPreview, typeMapping]
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

  const notebookId = useNotebookId();
  const [worker, resetWorker] = useWorker(msgStream, errorStream, notebookId);

  useEffect(() => {
    const sub = onReset.subscribe(resetWorker);

    return () => {
      sub.unsubscribe();
    };
  });

  const runCode = useCallback(() => {
    try {
      worker?.execute(code, deciVariables);
    } catch (err) {
      console.error(err);
      setResultPreview(undefined);
      onExecute({ status: 'error', err: err as Error });
    }
  }, [worker, code, deciVariables, setResultPreview, onExecute]);

  useEffect(() => {
    if (info.status === 'run') {
      onExecute({ status: 'unset' });
      setLog([{ status: 'run' }]);
      runCode();
    }
  }, [info.status, onExecute, runCode]);

  const [rd, fetchRd] = useRdFetch('generate-fetch-js');

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

  const onSubmitAi = async () => {
    const result = await updateQueryExecutionCount();
    const newExecutedQueryData = result.data?.incrementQueryCount;
    const errors = result.error?.graphQLErrors;
    const limitExceededError = errors?.find(
      (err) => err.extensions.code === 'LIMIT_EXCEEDED'
    );

    if (newExecutedQueryData) {
      fetchRd({
        url,
        exampleRes,
        prompt,
      });
      setCurrentWorkspaceInfo({
        ...workspaceInfo,
        queryCount: newExecutedQueryData.queryCount,
        quotaLimit: newExecutedQueryData.quotaLimit,
      });
    } else if (limitExceededError) {
      setMaxQueryExecution(true);
    }
  };

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
          onSubmit={onSubmitAi}
          generationRD={rd}
          maxQueryExecution={maxQueryExecution}
        />
      ) : (
        <CodeEditor
          code={code}
          setCode={(sourcecode) => setCode(sourcecode)}
          lang="javascript"
          log={log}
          setLog={setLog}
        />
      )}
    </>
  );
};
