import { useEffect } from 'react';
import {
  Result,
  InjectableExternalData,
  deserializeType,
  Computer,
} from '@decipad/computer';
import {
  ColIndex,
  ImportElementSource,
  TableCellType,
} from '@decipad/editor-types';
import { ImportResult } from '@decipad/import';
import { useLiveConnectionResponse } from './useLiveConnectionResponse';

export interface LiveConnectionResult {
  error?: Error;
  result?: ImportResult;
}

export interface LiveConnectionProps {
  blockId: string;
  url: string;
  options?: RequestInit;
  source?: ImportElementSource;
  useFirstRowAsHeader?: boolean;
  columnTypeCoercions: Record<ColIndex, TableCellType>;
}

const resultToInjectableExternalData = (
  result: Result.Result
): InjectableExternalData => {
  return {
    type: deserializeType(result.type),
    value: Result.resultToValue(result),
  };
};

export const useLiveConnection = (
  computer: Computer,
  {
    blockId,
    url,
    options,
    source,
    useFirstRowAsHeader,
    columnTypeCoercions,
  }: LiveConnectionProps
): LiveConnectionResult => {
  const { error, result } = useLiveConnectionResponse({
    url,
    options,
    source,
    useFirstRowAsHeader,
    columnTypeCoercions,
  });

  useEffect(() => {
    if (result) {
      const computerResult = result.result;
      if (
        computerResult.value != null &&
        typeof computerResult.value !== 'symbol'
      ) {
        const injectable = resultToInjectableExternalData(computerResult);
        computer.pushExternalDataUpdate(blockId, injectable);
      }
    }

    return () => {
      computer.pushExternalDataDelete(blockId);
    };
  }, [blockId, computer, result]);

  return { error, result };
};
