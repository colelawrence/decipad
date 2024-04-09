import type {
  LiveConnectionElement,
  LiveDataSetElement,
} from '@decipad/editor-types';
import {
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_DATASET,
} from '@decipad/editor-types';
import { assertElementMultipleType } from '@decipad/editor-utils';
import { LiveError } from '@decipad/ui';
import type { FC } from 'react';
import { useLiveConnectionCore } from '../hooks/useLiveConnectionCore';
import { useNotebookId } from '@decipad/react-contexts';

export interface LiveConnectionCoreProps {
  element: LiveConnectionElement | LiveDataSetElement;
  deleted: boolean;
}

export const LiveConnectionCore: FC<LiveConnectionCoreProps> = ({
  element,
  deleted,
}) => {
  assertElementMultipleType(element, [
    ELEMENT_LIVE_CONNECTION,
    ELEMENT_LIVE_DATASET,
  ]);

  const notebookId = useNotebookId();

  const { error, authenticate, clearCacheAndRetry } = useLiveConnectionCore({
    notebookId,
    element,
    deleted,
  });

  return (
    <div contentEditable={false}>
      {error ? (
        <LiveError
          error={error}
          errorURL={element.url || '/docs/'}
          onRetry={clearCacheAndRetry}
          onAuthenticate={authenticate}
        />
      ) : null}
    </div>
  );
};
