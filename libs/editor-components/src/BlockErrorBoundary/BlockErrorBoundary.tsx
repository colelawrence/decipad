import { FC, ReactNode } from 'react';
import { ErrorBoundary } from '@sentry/react';
import { MyElement, useTEditorRef } from '@decipad/editor-types';
import { removeNodes } from '@udecode/plate';
import { ErrorBlock } from '@decipad/ui';
import { useNodePath } from '@decipad/editor-utils';

interface FallbackProps {
  error: Error;
  componentStack: string | null;
  element: MyElement;
  resetError: () => void;
}

const Fallback: FC<FallbackProps> = ({
  error,
  element,
  resetError,
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
        resetError();
      }}
      onUndo={() => {
        editor.undo();
        resetError();
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
  return (
    <ErrorBoundary
      fallback={(props) => <Fallback {...props} element={element} />}
      showDialog={false}
    >
      {children}
    </ErrorBoundary>
  );
}
