import { ErrorInfo, FC, ReactNode, useCallback } from 'react';
import { MyElement, useTEditorRef } from '@decipad/editor-types';
import { removeNodes } from '@udecode/plate';
import { ErrorBlock } from '@decipad/ui';
import { useNodePath } from '@decipad/editor-hooks';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import * as Sentry from '@sentry/react';

interface FallbackProps {
  error: Error;
  element: MyElement;
  resetErrorBoundary: () => void;
}

const Fallback: FC<FallbackProps> = ({
  error,
  element,
  resetErrorBoundary,
}: FallbackProps) => {
  console.error(error);
  const editor = useTEditorRef();

  const delPath = useNodePath(element);
  if (delPath == null) return <ErrorBlock type="complete-error" />;

  return (
    <ErrorBlock
      type={editor.undoManager?.canUndo?.() ? 'warning' : 'error'}
      onDelete={() => {
        removeNodes(editor, {
          at: [delPath[0]],
        });
        resetErrorBoundary();
      }}
      onUndo={() => {
        editor.undo();
        resetErrorBoundary();
      }}
    />
  );
};

export function BlockErrorBoundary({
  children,
  element,
}: {
  children: ReactNode;
  element: MyElement;
}): ReturnType<FC> {
  const onError = useCallback(
    (err: Error, info: ErrorInfo) => {
      const { message } = err;
      console.error(err);
      // eslint-disable-next-line no-param-reassign
      err.message = `Block crash (${element.type}): ${message}`;
      Sentry.captureException(err, {
        level: 'fatal',
        extra: {
          info,
        },
      });
    },
    [element.type]
  );

  return (
    <ReactErrorBoundary
      onError={onError}
      fallbackRender={(props) => <Fallback {...props} element={element} />}
    >
      {children}
    </ReactErrorBoundary>
  );
}
