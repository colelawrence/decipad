import { lazy, Suspense } from 'react';
import type { PlateComponent } from '@decipad/editor-types';
import { LoadingIndicator, ErrorBlock } from '@decipad/ui';
import { useLockEditorWriting } from '@decipad/react-contexts';
import { ErrorBoundary } from '@sentry/react';

const EditorElementPlaceholder: PlateComponent = (props) => {
  useLockEditorWriting();
  return (
    <div {...props.attributes}>
      <div contentEditable={false}>
        <LoadingIndicator />
        {props.children}
      </div>
    </div>
  );
};

export const lazyElementComponent = (
  factory: Parameters<typeof lazy>['0']
): PlateComponent => {
  const LazyElementComponent = lazy(factory);

  const LazyElementLoader: PlateComponent = (props) => {
    return (
      <ErrorBoundary fallback={<ErrorBlock type="error" />}>
        <Suspense fallback={<EditorElementPlaceholder {...props} />}>
          <LazyElementComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };

  return LazyElementLoader;
};
