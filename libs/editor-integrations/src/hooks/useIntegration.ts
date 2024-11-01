/* eslint-disable no-console */
import { IntegrationTypes } from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate-common';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useResponsiveRunner } from '../runners';
import { useComputer } from '@decipad/editor-hooks';
import { useRenameIntegration } from './useRenameIntegration';
import { useNotebookId } from '@decipad/react-contexts';
import { isTableResult, pushResultToComputer } from '@decipad/computer-utils';
import { getDefined } from '@decipad/utils';
import { formatError } from '@decipad/format';

type ImportState =
  | {
      type: 'unloaded';
    }
  | {
      type: 'loading-cache';
    }
  | {
      type: 'loading-fetch';
    }
  | {
      type: 'loaded';
    }
  | {
      type: 'error';
      message: string;
    };

type UseIntegraionReturn = {
  onRefresh: () => void;
  importState: ImportState;
};

const WAIT_TIME_BEFORE_AUTO_FETCH_MS = 3_000;

export const useIntegration = (
  element: IntegrationTypes.IntegrationBlock
): UseIntegraionReturn => {
  const computer = useComputer();
  const [importState, setImportState] = useState<ImportState>({
    type: 'unloaded',
  });
  const [triedCache, setTriedCache] = useState(false);
  const [waitedABitAfterTriedCache, setWaitedABitAfterTriedCache] =
    useState(false);
  const result = computer.getBlockIdResult(element.id!);
  const setCachedResult = useRef(false);
  const calledOnRefreshAtLeastOnce = useRef(false);
  const notebookId = useNotebookId();

  const varName = useMemo(
    () => getNodeString(element.children[0]),
    [element.children]
  );

  const runner = useResponsiveRunner({
    id: element.id!,
    name: varName,
    integration: element,
    types: element.typeMappings,
    notebookId,
    computer,
    integrationType: undefined,
    filters: element.filters ?? [],
  });

  useRenameIntegration(runner, element);

  const hasErrorResult = useCallback(() => {
    return (
      result?.type === 'computer-result' &&
      (result.result.type.kind === 'type-error' ||
        (isTableResult(result.result) &&
          result.result.type.columnTypes.some((t) => t.kind === 'type-error')))
    );
  }, [result]);

  const haveValidResult = useCallback(() => {
    return (
      result != null &&
      result.type === 'computer-result' &&
      result.result.type.kind !== 'pending' &&
      !hasErrorResult()
    );
  }, [hasErrorResult, result]);

  const setImportStateSafe = useCallback((newState: ImportState) => {
    setImportState((prev) => {
      if (prev.type === newState.type) {
        return prev;
      }
      return newState;
    });
  }, []);

  const onRefresh = useCallback(() => {
    calledOnRefreshAtLeastOnce.current = true;
    // * -> loading-fetch
    setImportStateSafe({ type: 'loading-fetch' });
    runner.import().catch((err) => {
      setImportStateSafe({ type: 'error', message: err.message });
    });
  }, [runner, setImportStateSafe]);

  useEffect(() => {
    const { result: res } = result ?? {};
    // result has type error -> error
    if (res?.type.kind === 'type-error') {
      setImportStateSafe({
        type: 'error',
        message: formatError('en_US', res.type.errorCause),
      });
      return;
    }

    if (isTableResult(res)) {
      const columnIndexWithError = res.type.columnTypes.findIndex(
        (t) => t.kind === 'type-error'
      );
      if (columnIndexWithError >= 0) {
        const columnType = res.type.columnTypes[columnIndexWithError];
        if (columnType?.kind === 'type-error') {
          setImportStateSafe({
            type: 'error',
            message: `Error in column: ${formatError(
              'en_US',
              columnType.errorCause
            )}`,
          });
        }
      }
    }
  }, [result, setImportStateSafe]);

  useEffect(() => {
    // FIXME: HACK: push first cached result so that the computer can use it
    if (
      !setCachedResult.current &&
      !calledOnRefreshAtLeastOnce.current &&
      haveValidResult() &&
      result?.type === 'computer-result' &&
      result.fromCache
    ) {
      setCachedResult.current = true;
      pushResultToComputer(
        computer,
        getDefined(element.id),
        varName,
        getDefined(result).result
      );
    }
  }, [computer, element.id, haveValidResult, varName, result]);

  useEffect(() => {
    // setTriedCache to true
    computer.waitForTriedCache().then(() => {
      setTriedCache(true);
    });
  }, [computer]);

  useEffect(() => {
    // unloaded -> loading-cache
    if (importState.type === 'unloaded' && !triedCache && !haveValidResult()) {
      setImportStateSafe({ type: 'loading-cache' });
    }
  }, [
    computer,
    haveValidResult,
    importState.type,
    setImportStateSafe,
    triedCache,
  ]);

  useEffect(() => {
    // * -> loaded
    if (haveValidResult()) {
      setImportStateSafe({ type: 'loaded' });
    }
  }, [haveValidResult, setImportStateSafe]);

  useEffect(() => {
    // * -> unloaded
    if (
      !haveValidResult() &&
      !hasErrorResult() &&
      importState.type !== 'loading-cache' &&
      importState.type !== 'loading-fetch' &&
      triedCache
    ) {
      setImportStateSafe({ type: 'unloaded' });
    }
  }, [
    hasErrorResult,
    haveValidResult,
    importState.type,
    setImportStateSafe,
    triedCache,
  ]);

  useEffect(() => {
    // loading-cache -> wait a bit
    if (
      importState.type === 'loading-cache' &&
      triedCache &&
      !waitedABitAfterTriedCache &&
      !haveValidResult()
    ) {
      setTimeout(() => {
        setWaitedABitAfterTriedCache(true);
      }, WAIT_TIME_BEFORE_AUTO_FETCH_MS);
    }
  }, [
    haveValidResult,
    importState.type,
    onRefresh,
    triedCache,
    waitedABitAfterTriedCache,
  ]);

  useEffect(() => {
    // loading-cache -> onRefresh()
    if (
      importState.type === 'loading-cache' &&
      triedCache &&
      waitedABitAfterTriedCache &&
      !haveValidResult()
    ) {
      onRefresh();
    }
  }, [
    haveValidResult,
    importState.type,
    onRefresh,
    triedCache,
    waitedABitAfterTriedCache,
  ]);

  return {
    onRefresh,
    importState,
  };
};
