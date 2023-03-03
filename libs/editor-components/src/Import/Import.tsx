import { FC, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ELEMENT_IMPORT, PlateComponent } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { ErrorMessage, Spinner } from '@decipad/ui';
import { DraggableBlock } from '../block-management';
import { SuspendedImport } from './SuspendedImport';

const ErrorAdapter: FC<{ error: Error }> = ({ error }) => (
  <ErrorMessage error={error} variant="icononly" />
);

export const Import: PlateComponent = ({ attributes, element }) => {
  assertElementType(element, ELEMENT_IMPORT);

  return (
    <DraggableBlock blockKind="paragraph" element={element} {...attributes}>
      <ErrorBoundary FallbackComponent={ErrorAdapter}>
        <Suspense fallback={<Spinner />}>
          <SuspendedImport element={element} />
        </Suspense>
      </ErrorBoundary>
    </DraggableBlock>
  );
};
