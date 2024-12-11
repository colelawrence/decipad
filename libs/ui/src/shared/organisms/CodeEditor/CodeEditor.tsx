/* eslint decipad/css-prop-named-variable: 0 */
import { javascript } from '@codemirror/lang-javascript';
import { sql } from '@codemirror/lang-sql';
import { css } from '@emotion/react';
import CodeMirror, { useCodeMirror } from '@uiw/react-codemirror';
import { ComponentProps, FC, useCallback, useEffect, useRef } from 'react';
import { Code } from '../../../icons';
import {
  codeLog,
  cssVar,
  jsCode,
  componentCssVars,
  p12Regular,
} from '../../../primitives';
import { defaultScrollbarWidth } from '../../../styles/scrollbars';
import { themeStore } from '@decipad/utils';
import { TExecution } from '@decipad/interfaces';

const isE2E = 'navigator' in globalThis && navigator.webdriver;

interface CodeEditorProps {
  code: string;
  setCode: (newCode: string) => void;
  lang: 'javascript' | 'sql';
}

const logDetailHeight = 120;

export const Logs: FC<{
  type: CodeEditorProps['lang'];
  logs: Array<TExecution>;
}> = ({ type, logs }) => {
  if (logs.length === 0) {
    return null;
  }

  return (
    <div css={outputWrapperStyles}>
      <div css={innerWrapperStyles}>
        <div>
          <div css={iconWrapper}>
            <Code />
          </div>
          Output
        </div>
      </div>
      {logs.map((logEntry) => (
        <div css={outputStyles} key={JSON.stringify(logEntry)}>
          {logEntry.status === 'run' && (
            <>
              <span css={runExecutionStyles}>&#8505;&#65039;</span> Running
            </>
          )}
          {logEntry.status === 'error' && (
            <>
              <span css={outputErrorLabel}>&#9888;&#65039;</span>{' '}
              {logEntry.err.toString()}
            </>
          )}
          {logEntry.status === 'success' && (
            <>
              <span
                css={successExecutionStyles}
                data-testid="code-successfully-run"
              >
                &#9989;
              </span>{' '}
              {type === 'sql' ? 'Query' : 'Code'} ran successfully!
            </>
          )}
          {logEntry.status === 'warning' && (
            <>
              <span css={warningExecutionStyles}>&#9888;&#65039;</span>{' '}
              {logEntry.err.toString()}
            </>
          )}
          {logEntry.status === 'log' && (
            <>
              <span css={logExecutionStyles}>➤</span> {logEntry.log}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

const statusLineStyle = css(p12Regular, {
  padding: '4px 2px',
  paddingLeft: '8px',
});

export const StatusLine: FC<{
  type: CodeEditorProps['lang'];
  logs: Array<TExecution>;
}> = ({ logs, type }) => {
  if (logs.length === 0) {
    return null;
  }
  const logEntry = logs[logs.length - 1];
  return (
    <div css={statusLineStyle} key={JSON.stringify(logEntry)}>
      {logEntry.status === 'run' && (
        <>
          <span css={runExecutionStyles}>&#8505;&#65039;</span> Running
        </>
      )}
      {logEntry.status === 'error' && (
        <>
          <span css={outputErrorLabel}>&#9888;&#65039;</span>{' '}
          {logEntry.err.toString()}
        </>
      )}
      {logEntry.status === 'success' && (
        <>
          <span
            css={successExecutionStyles}
            data-testid="code-successfully-run"
          >
            &#9989;
          </span>{' '}
          {type === 'sql' ? 'Query' : 'Code'} ran successfully!
        </>
      )}
      {logEntry.status === 'warning' && (
        <>
          <span css={warningExecutionStyles}>&#9888;&#65039;</span>{' '}
          {logEntry.err.toString()}
        </>
      )}
      {logEntry.status === 'log' && (
        <>
          <span css={logExecutionStyles}>➤</span> {logEntry.log}
        </>
      )}
    </div>
  );
};
export const CodeEditor: FC<CodeEditorProps> = ({ code, setCode, lang }) => {
  const handleCode = useCallback<
    NonNullable<ComponentProps<typeof CodeMirror>['onChange']>
  >(
    (value, _update) => {
      setCode(value);
    },
    [setCode]
  );

  const editor = useRef<HTMLDivElement | null>(null);

  const { setContainer } = useCodeMirror({
    container: editor.current,
    value: isE2E ? '' : code,
    extensions: [lang === 'sql' ? sql() : javascript()],
    lang,
    theme: themeStore().theme ? 'dark' : 'light',
    onChange: handleCode,
    height: '100%',
    maxHeight: '100%',
    minHeight: '100%',
    basicSetup: isE2E
      ? false
      : {
          autocompletion: false,
          highlightActiveLineGutter: false,
          highlightActiveLine: false,
        },
  });

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
  }, [setContainer]);

  return (
    <div css={mainStyles}>
      <div data-testid="code-mirror" ref={editor} />
    </div>
  );
};

const mainStyles = css(jsCode, {
  width: '100%',

  height: '100%',

  '> div:first-of-type': {
    height: '100%',
  },
  '.cm-focused': {
    outline: 0,
  },
  '.cm-content': {
    paddingRight: '5em',
  },
  '.cm-theme, .cm-editor,': {
    borderRadius: '12px',
  },
  '.cm-scroller::-webkit-scrollbar': {
    width: defaultScrollbarWidth,
    height: defaultScrollbarWidth,
  },
  '.cm-scroller::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
  '.cm-scroller::-webkit-scrollbar-thumb': {
    backgroundColor: cssVar('iconColorDefault'),
    borderRadius: defaultScrollbarWidth,
  },
  '.cm-scroller::-webkit-scrollbar-corner': {
    backgroundColor: 'transparent',
  },
});

const outputWrapperStyles = css(codeLog, {
  overflow: 'auto',
  overflowX: 'hidden',
  height: logDetailHeight + 1, // as per design
  backgroundColor: cssVar('backgroundDefault'),
  borderRadius: '0 0 12px 12px',
  borderBottom: `1px solid ${cssVar('borderDefault')}`,
  padding: '10px',
});

const innerWrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',

  'div:first-child': {
    display: 'flex',
    left: -2,
    position: 'relative',
    alignItems: 'center',
    marginBottom: 4,
  },
});

const iconWrapper = css({
  width: '16px',
  height: '16px',
  display: 'inline-block',
  marginTop: '-2px',
  verticalAlign: 'middle',
});

const outputStyles = css({
  padding: '2px 0',
});

const successExecutionStyles = css({
  color: 'transparent',
  textShadow: `0 0 0 ${cssVar('backgroundHeavy')}`,
});

const warningExecutionStyles = css({
  color: 'transparent',
  textShadow: `0 0 0 ${cssVar('stateWarningBackground')}`,
});

const logExecutionStyles = css({
  color: 'transparent',
  textShadow: `0 0 0 ${componentCssVars('StrongSlashIconColor')}`,
});

const runExecutionStyles = css({
  color: 'transparent',
  textShadow: `0 0 0 ${componentCssVars('StrongSlashIconColor')}`,
});

const outputErrorLabel = css({
  color: 'transparent',
  textShadow: `0 0 0 ${cssVar('stateDangerBackground')}`,
});
