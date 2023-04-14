import { FC } from 'react';
import {
  ELEMENT_LIVE_CONNECTION,
  LiveConnectionElement,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { LiveConnectionResult } from '@decipad/ui';
import { LiveConnectionError } from './LiveConnectionError';
import { useLiveConnectionCore } from '../hooks/useLiveConnectionCore';

export interface LiveConnectionCoreProps {
  element: LiveConnectionElement;
  deleted: boolean;
}

export const LiveConnectionCore: FC<LiveConnectionCoreProps> = ({
  element,
  deleted,
}) => {
  assertElementType(element, ELEMENT_LIVE_CONNECTION);

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
