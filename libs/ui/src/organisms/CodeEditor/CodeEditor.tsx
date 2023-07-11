/* eslint decipad/css-prop-named-variable: 0 */
import { javascript } from '@codemirror/lang-javascript';
import {
  ExecutionContext,
  TExecution,
  useThemeFromStore,
} from '@decipad/react-contexts';
import { css } from '@emotion/react';
import CodeMirror, { useCodeMirror } from '@uiw/react-codemirror';
import {
  ComponentProps,
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Tooltip } from '../../atoms';
import { Code, Copy } from '../../icons';
import {
  codeLog,
  cssVar,
  deciCodeThemeDark,
  deciCodeThemeLight,
  jsCode,
  setCssVar,
} from '../../primitives';

interface CodeEditorProps {
  code: string;
  setCode: (newCode: string) => void;

  log: TExecution<boolean>[];
  setLog: Dispatch<SetStateAction<TExecution<boolean>[]>>;
}

const logDetailHeight = 120;
const editorHeight = 252;

export const CodeEditor: FC<CodeEditorProps> = ({
  code,
  setCode,
  log,
  setLog,
}) => {
  const { onExecute, info } = useContext(ExecutionContext);
  const [isDarkMode] = useThemeFromStore();

  const theme = useMemo(() => {
    return isDarkMode ? deciCodeThemeDark : deciCodeThemeLight;
  }, [isDarkMode]);

  const [userCopyPastedCode, setUserCopyPastedCode] = useState(false);
  const isE2E = 'navigator' in globalThis && navigator.webdriver;

  const handleCode = useCallback<
    NonNullable<ComponentProps<typeof CodeMirror>['onChange']>
  >(
    (value, _update) => {
      setCode(value);
      onExecute({ status: 'unset' });
    },
    [setCode, onExecute]
  );

  useEffect(() => {
    if (!(info.status === 'unset' || info.status === 'secret')) {
      setLog((logEntries: TExecution<boolean>[]) => [...logEntries, info]);
    }
  }, [info, info.status, setLog]);

  const editor = useRef<HTMLDivElement | null>(null);

  const { setContainer, view } = useCodeMirror({
    container: editor.current,
    value: isE2E ? '' : code,
    extensions: [javascript()],
    height: `${
      log.length > 0 ? editorHeight : editorHeight + logDetailHeight
    }px`,
    theme,
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

  const handleAddSecret = useCallback(
    (secretName: string) => {
      if (!editor.current || !view) return;
      const secretCode = `{{ secrets.${secretName} }}`;
      const { state } = view;
      const range = state.selection.ranges[0];
      view.dispatch({
        changes: {
          from: range.from,
          to: range.to,
          insert: secretCode,
        },
        selection: { anchor: range.from + 1 },
      });
    },
    [view]
  );

  useEffect(() => {
    if (info.status === 'secret') {
      handleAddSecret(info.name);
    }
  }, [handleAddSecret, info, info.status]);

  return (
    <>
      <div css={copyPasteWrapperStyle}>
        <Tooltip
          variant="small"
          open={userCopyPastedCode}
          trigger={
            <div
              css={copyPasteButtonStyle}
              onClick={() => {
                navigator.clipboard.writeText(code);
                setUserCopyPastedCode(true);
                setTimeout(() => setUserCopyPastedCode(false), 1000);
              }}
            >
              <Copy />
            </div>
          }
        >
          <p>Copied!</p>
        </Tooltip>
      </div>

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
                    <span css={runExecutionStyles}>&#8505;&#65039;</span>{' '}
                    Running
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
    </>
  );
};

const mainStyles = (hasLogs: boolean) =>
  css(jsCode, {
    width: '100%',
    borderRadius: '0 0 12px 12px',
    borderBottom: hasLogs
      ? 'unset'
      : `1px solid ${cssVar('borderHighlightColor')}`,
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
  });

const outputWrapperStyles = css(codeLog, {
  overflow: 'auto',
  overflowX: 'hidden',
  height: logDetailHeight + 1, // as per design
  backgroundColor: cssVar('highlightColor'),
  borderRadius: '0 0 12px 12px',
  borderBottom: `1px solid ${cssVar('borderHighlightColor')}`,
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
  textShadow: `0 0 0 ${cssVar('variableHighlightTextColor')}`,
});

const warningExecutionStyles = css({
  color: 'transparent',
  textShadow: `0 0 0 ${cssVar('toastWarning')}`,
});

const logExecutionStyles = css({
  color: 'transparent',
  textShadow: `0 0 0 ${cssVar('strongSlashIconColor')}`,
});

const runExecutionStyles = css({
  color: 'transparent',
  textShadow: `0 0 0 ${cssVar('strongSlashIconColor')}`,
});

const outputErrorLabel = css({
  color: 'transparent',
  textShadow: `0 0 0 ${cssVar('errorColor')}`,
});

const copyPasteWrapperStyle = css({
  height: 20,
  width: 20,
  borderRadius: 4,
  position: 'absolute',
  top: 150,
  right: 50,
  backgroundColor: cssVar('backgroundColor'),
  zIndex: 13,
  cursor: 'pointer',
  ':hover': {
    backgroundColor: cssVar('tintedBackgroundColor'),
    outline: `solid 1px ${cssVar('strongHighlightColor')}`,
  },
});
const copyPasteButtonStyle = css({
  width: 20,
  height: 20,
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
});
