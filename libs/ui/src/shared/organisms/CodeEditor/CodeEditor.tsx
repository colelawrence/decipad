/* eslint decipad/css-prop-named-variable: 0 */
import { javascript } from '@codemirror/lang-javascript';
import { sql } from '@codemirror/lang-sql';
import { TExecution } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import CodeMirror, { useCodeMirror } from '@uiw/react-codemirror';
import { ComponentProps, FC, useCallback, useEffect, useRef } from 'react';
import { Code } from '../../../icons';
import { codeLog, cssVar, jsCode, componentCssVars } from '../../../primitives';
import { defaultScrollbarWidth } from '../../../styles/scrollbars';
import { themeStore } from '@decipad/utils';

const isE2E = 'navigator' in globalThis && navigator.webdriver;

interface CodeEditorProps {
  code: string;
  setCode: (newCode: string) => void;
  lang: 'javascript' | 'sql';

  log: Array<TExecution>;
  setLog: (_: Array<TExecution>) => void;
}

const logDetailHeight = 120;
const editorHeight = 252;

export const CodeEditor: FC<CodeEditorProps> = ({
  code,
  setCode,
  lang,
  log,
}) => {
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
    height: `${
      log.length > 0 ? editorHeight : editorHeight + logDetailHeight
    }px`,
    theme: themeStore().theme ? 'dark' : 'light',
    onChange: handleCode,
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
    <div css={mainStyles(log.length > 0)}>
      <div data-testid="code-mirror" ref={editor} />
      {log.length > 0 && (
        <div css={outputWrapperStyles}>
          <div
            css={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <div
              css={{
                display: 'flex',
                left: -2,
                position: 'relative',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <div css={iconWrapper}>
                <Code />
              </div>
              Output
            </div>
          </div>
          {log.map((logEntry, i) => (
            <div css={outputStyles} key={`log-line-${i}`}>
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
                  Code successfully run!
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
      )}
    </div>
  );
};

const mainStyles = (hasLogs: boolean) =>
  css(jsCode, {
    width: '100%',
    borderRadius: '0 0 12px 12px',
    borderBottom: hasLogs ? 'unset' : `1px solid ${cssVar('borderDefault')}`,
    '.cm-focused': {
      outline: 0,
    },
    '.cm-gutters, .cm-content': {
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: hasLogs ? 0 : 12,
    },
    '.cm-theme, .cm-editor,': {
      borderRadius: `12px 12px ${hasLogs ? '0 0' : '12px 12px'}`,
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
