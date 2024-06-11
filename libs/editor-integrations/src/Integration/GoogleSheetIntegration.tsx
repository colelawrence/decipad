import type { IntegrationTypes } from '@decipad/editor-types';
import { Result, materializeResult } from '@decipad/remote-computer';
import { tryImport } from '@decipad/import';
import { pushResultToComputer } from '@decipad/live-connect';
import {
  useConnectionStore,
  useGSheetConnectionStore,
} from '@decipad/react-contexts';
import { getNodeString } from '@udecode/plate-common';
import { useEffect, useCallback, useRef } from 'react';
import { useIntegrationOptions } from '../hooks';
import { getExternalDataUrl } from '../utils';
import { useComputer } from '@decipad/editor-hooks';

export const GoogleSheetIntegration: React.FC<
  IntegrationTypes.IntegrationBlock<'gsheets'> & {
    element: IntegrationTypes.IntegrationBlock;
  }
> = ({
  integrationType,
  id,
  children,
  latestResult,
  element,
  typeMappings,
}) => {
  const computer = useComputer();
  const varName = getNodeString(children[0]);
  const currentResult = useRef<Result.Result | undefined>(undefined);

  const importResult = useCallback(
    async (rawResult: string | undefined): Promise<string> => {
      const googleSheetImport = await tryImport(
        {
          provider: 'gsheets',
          computer,
          url: new URL(integrationType.spreadsheetUrl),
          proxy: new URL(getExternalDataUrl(integrationType.externalDataId)),
        },
        {
          useRawResult: rawResult,
          useFirstRowAsHeader: true,
        }
      );

      if (googleSheetImport.length !== 1) {
        throw new Error('not implemented yet. Multiple imported');
      }

      const importedResult = googleSheetImport[0];
      if (
        importedResult == null ||
        importedResult.rawResult == null ||
        importedResult.result == null
      ) {
        throw new Error('No result was imported');
      }

      const result = await materializeResult(importedResult.result);
      pushResultToComputer(computer, id, varName, result);
      currentResult.current = result;

      return typeof importedResult.rawResult === 'object'
        ? JSON.stringify(importedResult.rawResult)
        : importedResult.rawResult;
    },
    [
      computer,
      id,
      integrationType.externalDataId,
      integrationType.spreadsheetUrl,
      varName,
    ]
  );

  useEffect(() => {
    importResult(latestResult);
  }, [computer, id, importResult, latestResult, varName]);

  useIntegrationOptions(element, {
    onRefresh() {
      return importResult(undefined);
    },
    onShowSource() {
      const store = useConnectionStore.getState();
      const gsheetStore = useGSheetConnectionStore.getState();

      store.abort();

      store.Set({
        connectionType: 'gsheets',
        stage: 'connect',
        existingIntegration: id,
        rawResult: latestResult,
        resultPreview: currentResult.current,
        varName,
      });

      store.setAllTypeMapping(typeMappings);
      store.changeOpen(true);

      gsheetStore.Set({
        SpreadsheetURL: integrationType.spreadsheetUrl,
        ExternalDataId: integrationType.externalDataId,
        ExternalDataName: integrationType.externalDataName,
        SelectedSubsheet: integrationType.selectedSubsheet,
      });
    },
  });

  return null;
};
