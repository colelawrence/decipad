import { FC, ReactNode } from 'react';
import { ErrorBoundary } from '@sentry/react';
import { organisms } from '@decipad/ui';
import { MyElement, useTEditorRef } from '@decipad/editor-types';
import { findNodePath, removeNodes } from '@udecode/plate';

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

  const delPath = findNodePath(editor, element);
  if (delPath === undefined)
    return <organisms.ErrorBlock type="complete-error" />;

  return (
    <organisms.ErrorBlock
      type={editor.history.undos.length > 0 ? 'warning' : 'error'}
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
