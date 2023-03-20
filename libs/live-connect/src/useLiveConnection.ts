import { useEffect } from 'react';
import { Computer } from '@decipad/computer';
import {
  ColIndex,
  ImportElementSource,
  TableCellType,
} from '@decipad/editor-types';
import { ImportResult } from '@decipad/import';
import { useCache } from '@decipad/editor-utils';
import { useLiveConnectionResponse } from './useLiveConnectionResponse';
import { deserializeImportResult } from './utils/deserializeImportResult';

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
  maxCellCount: number;
  deleted: boolean;
}

export const useLiveConnection = (
  computer: Computer,
  {
    blockId,
    url,
    options,
    source,
    useFirstRowAsHeader,
    columnTypeCoercions,
    maxCellCount,
    deleted,
  }: LiveConnectionProps
): LiveConnectionResult => {
  const { error, result: liveConnectionResult } = useLiveConnectionResponse({
    url,
    options,
    source,
    useFirstRowAsHeader,
    columnTypeCoercions,
    maxCellCount,
  });

  const result = useCache({
    blockId,
    deleted,
    value: liveConnectionResult,
    deserialize: deserializeImportResult,
  });

  useEffect(() => {
    const computerResult = result?.result;
    if (
      computerResult?.value != null &&
      typeof computerResult.value !== 'symbol'
    ) {
      computer.pushExternalDataUpdate(blockId, computerResult);
    } else {
      computer.pushExternalDataDelete(blockId);
    }
  }, [blockId, computer, result]);

  useEffect(() => {
    return () => {
      computer.pushExternalDataDelete(blockId);
    };
  }, [computer, blockId]);

  return { error, result };
};
