/* eslint decipad/css-prop-named-variable: 0 */

import { Fragment, useCallback, useContext, useState } from 'react';
import copyToClipboard from 'copy-to-clipboard';
import { css } from '@emotion/react';
import { IntegrationMessageData, addEnvVars } from '@decipad/utils';
import { ErrorMessageType, WorkerMessageType } from '@decipad/safejs';
import { AssistantMessage, ExecutionContext } from '@decipad/react-contexts';
import { nanoid } from 'nanoid';
import {
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_INTEGRATION,
  ELEMENT_STRUCTURED_VARNAME,
  MyValue,
} from '@decipad/editor-types';
import { EElementOrText } from '@udecode/plate-common';
import { useWorkspaceSecrets } from '@decipad/graphql-client';
import { useWorker } from '@decipad/editor-hooks';
import { Chevron, Code, DeciAI, Duplicate } from '../../icons';
import {
  componentCssVars,
  cssVar,
  p13Medium,
  p14Regular,
} from '../../primitives';

import { ChatMarkdownRenderer } from '../ChatMarkdownRenderer/ChatMarkdownRenderer';
import { Button, InputField, Tooltip } from '../../atoms';
import {
  columnTypeCoercionsToRec,
  importFromUnknownJson,
} from '@decipad/import';
import { ResultPreview } from './ResultPreview';
import { SecretInput } from './SecretInput';
import { CodeEditor } from '../../organisms';

const wrapperStyles = css({
  display: 'flex',
  padding: '8px 0px',
  gap: 4,
});

const avatarStyles = css({
  width: 28,
  height: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '4px 0px',
  flexShrink: 0,
  borderRadius: '50%',
  backgroundColor: componentCssVars('AIAssistantBackgroundColor'),

  '& svg': {
    width: 16,
    height: 16,

    '& path': {
      fill: componentCssVars('AIAssistantTextColor'),
    },
  },
});

const contentStyles = css(p14Regular, {
  position: 'relative',
  width: '100%',
  lineHeight: '20px',
  padding: '2px 0px',
  color: cssVar('textHeavy'),
  borderRadius: 12,
  display: 'grid',
  gridTemplateColumns: 'auto 40px',
});

const buttonStyles = css(p13Medium, {
  height: 24,
  width: 24,
  margin: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 6,
  cursor: 'pointer',

  '& > svg': {
    width: 16,
    height: 16,
  },

  '&:hover': {
    backgroundColor: cssVar('backgroundDefault'),
  },

  '&:active': {
    backgroundColor: cssVar('backgroundHeavy'),
  },
});

const codeContainerStyles = css({
  // HACK
  maxWidth: '528px',
});

const codeHeaderStyles = css({
  display: 'flex',
  padding: '4px 2px 4px 4px',
  justifyContent: 'space-between',
  alignItems: 'center',
  alignSelf: 'stretch',
  height: 20,
  borderRadius: 4,
  background: cssVar('backgroundAccent'),
  svg: {
    height: '100%',
    marginRight: 4,
  },
});

const showCodeButtonStyles = css({
  marginLeft: 'auto',
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  color: cssVar('textSubdued'),
  '& > svg': {
    height: 16,
    width: 16,
    padding: 2,
  },
});

const formStyles = css({
  display: 'grid',
  gap: 8,
  gridTemplateColumns: 'auto 1fr',
  padding: 8,
  width: '100%',
  label: {
    display: 'flex',
    alignItems: 'center',
  },
});

const buttonContainerStyles = css({
  display: 'inline-flex',
  justifyContent: 'flex-start',
  padding: 8,
  gap: 8,
});

const errorContentStyles = css(p14Regular, {
  position: 'relative',
  width: '100%',
  lineHeight: '20px',
  padding: '6px 12px',
  borderRadius: 8,
  backgroundColor: cssVar('stateDangerBackground'),
  color: cssVar('stateDangerText'),
});

const loadingContentStyles = css(p14Regular, {
  position: 'relative',
  width: '100%',
  lineHeight: '20px',
  padding: '6px',
  borderRadius: 8,
  color: cssVar('textSubdued'),
});

const jsonToResult = (json: string) => {
  return importFromUnknownJson(JSON.parse(json), {
    columnTypeCoercions: columnTypeCoercionsToRec({}),
  });
};

type DataPreview =
  | {
      status: 'not asked';
    }
  | {
      status: 'loading';
    }
  | {
      status: 'error';
      msg: string;
    }
  | {
      status: 'success';
      result: string;
    };

const Integration = ({
  fnName,
  jsDocParams,
  envVars,
  params,
  functionBody,
  notebookId,
  workspaceId,
  insertNodes,
}: IntegrationMessageData & {
  notebookId: string;
  workspaceId: string;
  insertNodes: (
    ops: EElementOrText<MyValue> | EElementOrText<MyValue>[]
  ) => void;
}) => {
  const [showCode, setShowCode] = useState(false);
  const [paramValues, setParamValues] = useState(
    new Map<string, string>(params.map((param) => [param, '']))
  );
  const [envVarValues, setEnvVarValues] = useState(
    new Map<string, string>(envVars.map((envVar) => [envVar, '']))
  );
  const [resultJSON, setResultJSON] = useState<DataPreview>({
    status: 'not asked',
  });
  const [timeOfLastRun, setTimeofLastRun] = useState<string | null>(null);
  const { onExecute } = useContext(ExecutionContext);
  const { secrets } = useWorkspaceSecrets(workspaceId);

  const msgStream = useCallback(
    (msg: WorkerMessageType) => {
      // error
      if (typeof msg.result !== 'string') {
        setResultJSON({ status: 'error', msg: msg.result.message });
        return;
      }

      // Check we have valid JSON, then save the JSON anyway.
      try {
        JSON.parse(msg.result);
      } catch (e) {
        setResultJSON({ status: 'error', msg: 'Unable to parse JSON.' });
      }
      setTimeofLastRun(new Date().toISOString());
      setResultJSON({ status: 'success', result: msg.result });
    },
    [setResultJSON]
  );

  const errorStream = useCallback(
    (msg: ErrorMessageType) => {
      console.error('err', msg);
      // Print the logs
      for (const workerLog of msg.logs) {
        onExecute({ status: 'log', log: workerLog });
      }
      setResultJSON({ status: 'error', msg: msg.result.message });
    },
    [onExecute]
  );

  const [worker] = useWorker(msgStream, errorStream, notebookId);

  const runCode = useCallback(() => {
    const codeWithEnvVars = addEnvVars(functionBody, envVarValues);

    worker?.execute(codeWithEnvVars, Object.fromEntries(paramValues));
  }, [worker, functionBody, paramValues, envVarValues]);

  const insertIntegration = useCallback(() => {
    if (!functionBody) throw new Error('no code');
    if (resultJSON.status !== 'success') throw new Error('no results');
    const vars = [...paramValues.entries()].map(
      ([name, value]): EElementOrText<MyValue> => {
        return {
          id: nanoid(),
          type: ELEMENT_CODE_LINE_V2,
          children: [
            {
              id: nanoid(),
              type: ELEMENT_STRUCTURED_VARNAME,
              children: [
                {
                  text: name,
                },
              ],
            },
            {
              id: nanoid(),
              type: ELEMENT_CODE_LINE_V2_CODE,
              children: [
                {
                  text: `"${value}"`,
                },
              ],
            },
          ],
        };
      }
    );
    const newIntegration: EElementOrText<MyValue> = {
      id: nanoid(),
      type: ELEMENT_INTEGRATION,
      children: [{ text: fnName }],
      typeMappings: [],
      integrationType: {
        type: 'codeconnection',
        code: addEnvVars(functionBody, envVarValues),
        latestResult: resultJSON.result,
        timeOfLastRun,
      },
    };
    insertNodes([...vars, newIntegration]);
  }, [
    functionBody,
    resultJSON,
    insertNodes,
    timeOfLastRun,
    fnName,
    envVarValues,
    paramValues,
  ]);

  return (
    <div>
      <div css={codeContainerStyles}>
        <div css={codeHeaderStyles}>
          <Code />
          Code
          <button
            onClick={() => setShowCode(!showCode)}
            css={showCodeButtonStyles}
          >
            {showCode ? 'Hide' : 'Show'}
            <Chevron type={showCode ? 'collapse' : 'expand'} />
          </button>
        </div>
        {showCode && (
          <CodeEditor
            code={functionBody}
            setCode={() => {}}
            lang="javascript"
            log={[]}
            setLog={() => {}}
          />
        )}
      </div>
      <form css={formStyles}>
        {params.map((param) => {
          if (!jsDocParams) return null;
          const jsDocParam = jsDocParams[param];
          const description = jsDocParam?.description || '';
          const value = paramValues.get(param) || '';
          return (
            <Fragment key={param}>
              <label>{param}</label>
              <InputField
                value={value}
                onChange={(text) => {
                  setParamValues((fields) => {
                    const newFields = new Map(fields);
                    newFields.set(param, text);
                    return newFields;
                  });
                }}
                placeholder={description}
                size="small"
              />
            </Fragment>
          );
        })}
        {envVars.map((envVar) => {
          const value = envVarValues.get(envVar) || '';

          return (
            <SecretInput
              key={envVar}
              envVar={envVar}
              value={value}
              workspaceId={workspaceId}
              setValue={(evName) => {
                setEnvVarValues((fields) => {
                  const newFields = new Map(fields);
                  newFields.set(envVar, evName);
                  return newFields;
                });
              }}
              secrets={secrets?.map((s) => s.name) || []}
            />
          );
        })}
      </form>
      {resultJSON.status === 'loading' && (
        <div css={loadingContentStyles}>Fetching results</div>
      )}
      {resultJSON.status === 'error' && (
        <div css={errorContentStyles}>{resultJSON.msg}</div>
      )}
      {resultJSON.status === 'success' && functionBody && (
        <ResultPreview
          result={jsonToResult(resultJSON.result)}
          name={fnName}
          setName={() => {}}
          setTypeMapping={() => {}}
        />
      )}
      <div css={buttonContainerStyles}>
        <Button
          type="primary"
          size="extraExtraSlim"
          onClick={() => {
            runCode();
          }}
        >
          Run
        </Button>
        <Button
          type="primary"
          size="extraExtraSlim"
          onClick={insertIntegration}
        >
          Insert
        </Button>
      </div>
    </div>
  );
};

type NewType = EElementOrText<MyValue>;

type Props = {
  readonly message: AssistantMessage;
  readonly notebookId: string;
  readonly workspaceId: string;
  readonly insertNodes: (ops: EElementOrText<MyValue> | NewType[]) => void;
};

export const ChatIntegrationMessage: React.FC<Props> = ({
  message,
  notebookId,
  workspaceId,
  insertNodes,
}) => {
  const { content } = message.integrationData
    ? message.integrationData
    : message;

  return (
    <div css={wrapperStyles}>
      <div css={avatarStyles}>
        <DeciAI />
      </div>
      <div css={contentStyles}>
        <ChatMarkdownRenderer content={content} />

        <Tooltip
          trigger={
            <button
              onClick={() => copyToClipboard(content || '')}
              css={buttonStyles}
              data-testid="copy-button"
            >
              <Duplicate />
            </button>
          }
        >
          Copy response to clipboard
        </Tooltip>
        {message.integrationData && (
          <Integration
            {...message.integrationData}
            notebookId={notebookId}
            workspaceId={workspaceId}
            insertNodes={insertNodes}
          />
        )}
      </div>
    </div>
  );
};
