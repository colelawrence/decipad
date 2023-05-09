import { FC } from 'react';
import {
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_DATASET,
  LiveConnectionElement,
  LiveDataSetElement,
} from '@decipad/editor-types';
import { LiveConnectionResult } from '@decipad/ui';
import { assertElementMultipleType } from '@decipad/editor-utils';
import { LiveConnectionError } from './LiveConnectionError';
import { useLiveConnectionCore } from '../hooks/useLiveConnectionCore';

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

  const {
    result,
    error,
    authenticate,
    setIsFirstRowHeader,
    onChangeColumnType,
    clearCacheAndRetry,
  } = useLiveConnectionCore({
    element,
    deleted,
  });

  return (
    <div contentEditable={false}>
      {result && (
        <LiveConnectionResult
          result={result}
          isFirstRowHeaderRow={element.isFirstRowHeaderRow}
          setIsFirstRowHeader={setIsFirstRowHeader}
          onChangeColumnType={onChangeColumnType}
          element={element}
          showLiveQueryResults={!element.hideLiveryQueryResults}
        ></LiveConnectionResult>
      )}
      {error ? (
        <LiveConnectionError
          error={error}
          errorURL={element.url || '/docs/'}
          onRetry={clearCacheAndRetry}
          onAuthenticate={authenticate}
        />
      ) : null}
    </div>
  );
};
