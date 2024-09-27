import type { IntegrationTypes } from '@decipad/editor-types';
import {
  CodeRunner,
  CSVRunner,
  GenericContainerRunner,
  LegacyRunner,
} from './types';
import type { Computer } from '@decipad/computer-interfaces';
import { useMemo } from 'react';
import { useNotebookRoute } from '@decipad/routing';
import { useComputer, useLiveConnectionWorker } from '@decipad/editor-hooks';
import { LiveConnectionWorker } from '@decipad/live-connect';

type RunnerFactoryParams = {
  integration: IntegrationTypes.IntegrationBlock['integrationType'];
  types: IntegrationTypes.IntegrationBlock['typeMappings'];
  notebookId: string;
  computer: Computer;
  isFirstRowHeader: boolean;
  name: string;
  id: string;
  worker: LiveConnectionWorker;
};

function getRunner(options: RunnerFactoryParams): GenericContainerRunner {
  switch (options.integration.type) {
    case 'csv':
      const csvRunner = new CSVRunner(
        options.name,
        options.id,
        options.integration.csvUrl,
        options.types,
        options.notebookId
      );
      return csvRunner;
    case 'notion':
      return new LegacyRunner(
        options.name,
        options.id,
        options.worker,
        options.integration.notionUrl,
        options.types,
        'notion',
        options.notebookId
      );
    case 'gsheets':
      const runner = new LegacyRunner(
        options.name,
        options.id,
        options.worker,
        options.integration.spreadsheetUrl,
        options.types,
        'gsheets',
        options.notebookId
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
      const sqlRunner = new LegacyRunner(
        options.name,
        options.id,
        options.worker,
        options.integration.url,
        options.types,
        'mysql',
        options.notebookId
      );
      sqlRunner.setQuery(options.integration.query);

      return sqlRunner;
    case 'codeconnection':
      return new CodeRunner(
        options.notebookId,
        options.computer,
        options.name,
        options.id,
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
  name: string,
  id: string,
  integration: IntegrationTypes.IntegrationBlock['integrationType'],
  types: IntegrationTypes.IntegrationBlock['typeMappings'],
  isFirstRowHeader: boolean
): GenericContainerRunner {
  const computer = useComputer();

  const worker = useLiveConnectionWorker();

  const { notebookId } = useNotebookRoute();

  return useMemo(
    () =>
      runnerFactory({
        name,
        id,
        integration,
        types,
        notebookId,
        computer,
        isFirstRowHeader,
        worker,
      }),
    [
      name,
      worker,
      id,
      integration,
      types,
      notebookId,
      computer,
      isFirstRowHeader,
    ]
  );
}
