import { lazy, Suspense } from 'react';
import { PlateComponent } from '@decipad/editor-types';
import { LoadingIndicator } from '@decipad/ui';
import { useLockEditorWriting } from '@decipad/react-contexts';

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
      <Suspense fallback={<EditorElementPlaceholder {...props} />}>
        <LazyElementComponent {...props} />
      </Suspense>
    );
  };

  return LazyElementLoader;
};
