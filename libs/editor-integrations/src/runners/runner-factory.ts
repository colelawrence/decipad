import type { IntegrationTypes } from '@decipad/editor-types';
import { CodeRunner, GenericContainerRunner, URLRunner } from './types';
import type { Computer } from '@decipad/computer-interfaces';
import { useMemo } from 'react';
import { notebooks, useRouteParams } from '@decipad/routing';
import { useComputer, useLiveConnectionWorker } from '@decipad/editor-hooks';
import type { LiveConnectionWorker } from '@decipad/live-connect';

type RunnerFactoryParams = {
  integration: IntegrationTypes.IntegrationBlock['integrationType'];
  types: IntegrationTypes.IntegrationBlock['typeMappings'];
  notebookId: string;
  computer: Computer;
  isFirstRowHeader: boolean;
  worker: LiveConnectionWorker;
};

function getRunner(options: RunnerFactoryParams): GenericContainerRunner {
  switch (options.integration.type) {
    case 'csv':
      const csvRunner = new URLRunner(
        options.worker,
        options.integration.csvUrl,
        options.types,
        'csv'
      );
      return csvRunner;
    case 'notion':
      return new URLRunner(
        options.worker,
        options.integration.notionUrl,
        options.types,
        'notion'
      );
    case 'gsheets':
      const runner = new URLRunner(
        options.worker,
        options.integration.spreadsheetUrl,
        options.types,
        'gsheets'
      );

      const url = new URL(options.integration.spreadsheetUrl);

      const spreadsheetUrl = url.searchParams.get('url');
      if (spreadsheetUrl == null) {
        // Imported directly from GSheet URL.
        runner.setUrl(url.toString());

        return runner;
      }

      const urlWithHash = new URL(url.searchParams.get('url')!);
      urlWithHash.hash = url.hash;

      // data?url=googlehseeturl
      runner.setUrl(urlWithHash.toString());
      runner.setProxy(url.origin + url.pathname);

      return runner;
    case 'mysql':
      const sqlRunner = new URLRunner(
        options.worker,
        options.integration.url,
        options.types,
        'mysql'
      );
      sqlRunner.setQuery(options.integration.query);

      return sqlRunner;
    case 'codeconnection':
      return new CodeRunner(
        options.notebookId,
        options.computer,
        options.integration.code,
        options.types
      );
    default:
      throw new Error('NOT IMPLEMENTED');
  }
}

export function runnerFactory(
  options: RunnerFactoryParams
): GenericContainerRunner {
  const runner = getRunner(options);

  runner.setIsFirstRowHeader(options.isFirstRowHeader);

  return runner;
}

export function useRunner(
  integration: IntegrationTypes.IntegrationBlock['integrationType'],
  types: IntegrationTypes.IntegrationBlock['typeMappings'],
  isFirstRowHeader: boolean
): GenericContainerRunner {
  const computer = useComputer();
  const worker = useLiveConnectionWorker();

  const {
    notebook: { id: notebookId },
  } = useRouteParams(notebooks({}).notebook);

  return useMemo(
    () =>
      runnerFactory({
        worker,
        integration,
        types,
        notebookId,
        computer,
        isFirstRowHeader,
      }),
    [computer, integration, isFirstRowHeader, notebookId, types, worker]
  );
}
