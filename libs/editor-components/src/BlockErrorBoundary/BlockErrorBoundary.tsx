import type { ErrorInfo, FC, ReactNode } from 'react';
import { useCallback } from 'react';
import type { MyElement } from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import { removeNodes } from '@udecode/plate-common';
import { ErrorBlock } from '@decipad/ui';
import { useNodePath } from '@decipad/editor-hooks';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import * as Sentry from '@sentry/react';
import { useIsEditorReadOnly } from '@decipad/react-contexts';

interface FallbackProps {
  error: Error;
  element?: MyElement;
  resetErrorBoundary: () => void;
}

const DefaultFallback: FC<FallbackProps> = ({
  error,
  element,
  resetErrorBoundary,
}) => {
  console.error(error);
  const editor = useMyEditorRef();
  const isReadOnly = useIsEditorReadOnly();

  const delPath = useNodePath(element);
  if (delPath == null) return <ErrorBlock type="complete-error" />;

  if (isReadOnly) {
    return null;
  }

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
  UserFallback = DefaultFallback,
}: {
  children: ReactNode;
  element?: MyElement;
  UserFallback?: FC<FallbackProps>;
}): ReturnType<FC> {
  const onError = useCallback(
    (err: Error, info: ErrorInfo) => {
      const { message } = err;
      // eslint-disable-next-line no-param-reassign
      err.message = `Block crash (${element?.type ?? 'unknown'}): ${message}`;
      console.error('BlockErrorBoundary error caught', err);
      Sentry.captureException(err, {
        level: 'fatal',
        extra: {
          info,
        },
      });
    },
    [element?.type]
  );

  return (
    <ReactErrorBoundary
      onError={onError}
      fallbackRender={(props) => <UserFallback {...props} element={element} />}
    >
      {children}
    </ReactErrorBoundary>
  );
}
