import type { Filter, IntegrationTypes } from '@decipad/editor-types';
import type { Computer } from '@decipad/computer-interfaces';
import { Runner } from './runner';
import { CSVRunner } from './csv';
import { IntegrationBlock } from 'libs/editor-types/src/integrations';
import { CodeRunner } from './code';
import { useEffect, useMemo, useState } from 'react';
import { SQLRunner } from './mysql';
import { NotionRunner } from './notion';
import { GSheetRunner } from './gsheet';
import { omit } from 'lodash';
import { dequal } from '@decipad/utils';

export type RunnerFactoryParams = {
  notebookId: string;
  computer: Computer;

  name: string;
  id: string;

  types: IntegrationTypes.IntegrationBlock['typeMappings'];

  filters: Filter[];
} & (
  | {
      integration: IntegrationTypes.IntegrationBlock;
      integrationType: undefined;
    }
  | {
      integration: undefined;
      integrationType: IntegrationTypes.IntegrationBlock['integrationType']['type'];
    }
);

function getRunner(options: RunnerFactoryParams): Runner {
  const integrationType = options.integration
    ? options.integration?.integrationType
    : ({ type: options.integrationType } as Partial<
        IntegrationBlock['integrationType']
      >);

  switch (integrationType.type) {
    case 'csv':
      const csvRunner = new CSVRunner(options.id, {
        name: options.name,
        padId: options.notebookId,
        importer: {
          isFirstHeaderRow: options.integration?.isFirstRowHeader ?? true,
        },
        runner: { csvUrl: integrationType.csvUrl },
        types: options.types,
        filters: options.filters,
      });
      return csvRunner;
    case 'notion':
      return new NotionRunner(options.id, {
        name: options.name,
        runner: { notionUrl: integrationType.notionUrl },
        importer: {},
        types: options.types,
        padId: options.notebookId,
        filters: options.filters,
      });
    case 'gsheets':
      return new GSheetRunner(options.id, {
        name: options.name,
        runner: {
          spreadsheetUrl: integrationType.spreadsheetUrl,
          range: integrationType.range,
        },
        importer: {
          isFirstHeaderRow: options.integration?.isFirstRowHeader ?? true,
          range: integrationType.range
            ? GSheetRunner.parseRange(integrationType.range)
            : undefined,
        },
        types: options.types,
        padId: options.notebookId,
        filters: options.filters,
      });
    case 'mysql':
      return new SQLRunner(options.id, {
        name: options.name,
        runner: { url: integrationType.url, query: integrationType.query },
        importer: {},
        types: options.types,
        padId: options.notebookId,
        filters: options.filters,
      });
    case 'codeconnection':
      return new CodeRunner(options.id, {
        padId: options.notebookId,
        name: options.name,
        importer: {
          isFirstHeaderRow: options.integration?.isFirstRowHeader ?? false,
        },
        runner: { code: integrationType.code },
        types: options.types,
        filters: options.filters,
      });
    default:
      throw new Error('NOT IMPLEMENTED');
  }
}

/**
 * @returns a static runner that will not be rebuilt if the `opts` change.
 */
export const useRunner = (opts: RunnerFactoryParams) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => getRunner(opts), [opts.id, opts.integration]);
};

const integrationWithoutChildren = (
  integration: RunnerFactoryParams['integration']
): Omit<RunnerFactoryParams['integration'], 'children' | 'hideResult'> => {
  return omit(integration, ['children', 'hideResult']);
};

const useDeepEqualState = <TInput, TOutput>(
  input: TInput,
  transformer: (i: TInput) => TOutput
): TInput => {
  const [state, setState] = useState<TInput>(input);

  useEffect(() => {
    const previousState = transformer(state);
    const newState = transformer(input);
    if (dequal(previousState, newState)) {
      return;
    }

    setState(input);
    // Don't memo the transformer function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, state]);

  return state;
};

const identity = <T>(i: T) => i;

export const useResponsiveRunner = (opts: RunnerFactoryParams) => {
  const diffedIntegration = useDeepEqualState(
    opts.integration,
    integrationWithoutChildren
  );
  const diffedTypes = useDeepEqualState(opts.types, identity);

  return useMemo(() => {
    return getRunner({
      name: opts.name,
      id: opts.id,
      computer: opts.computer,
      notebookId: opts.notebookId,
      integrationType: opts.integrationType,

      types: diffedTypes,
      integration: diffedIntegration,
      filters: opts.filters,
    } as RunnerFactoryParams);
    // Don't depend on name.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    diffedIntegration,
    diffedTypes,
    opts.computer,
    opts.id,
    opts.integrationType,
    opts.notebookId,
  ]);
};
