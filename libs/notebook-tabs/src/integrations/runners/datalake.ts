/* eslint-disable no-console */
import type { JSONSchema7 as JSONSchema } from 'json-schema';
import { IntegrationTypes } from '@decipad/editor-types';
import { getVariablesFromComputer } from '@decipad/computer-utils';
import type { Computer } from '@decipad/computer';
import { fetch } from '@decipad/fetch';
import { assert } from '@decipad/utils';
import { Importer } from '@decipad/compute-backend-js';
import { type Options, Runner } from './runner';
import { applyToTemplate, getTemplateVariables } from './utils';

type T = 'datalake';
type O = Omit<IntegrationTypes.DataLakeBlockIntegration, 'type'>;
export class DataLakeRunner extends Runner<T, O> {
  public readonly type = 'datalake' as const;

  public resourceName: string | undefined = undefined;

  public assertedOptions(): Pick<
    Options<'datalake', O>,
    'runner' | 'importer'
  > {
    console.log('assertedOptions', this.options);
    assert(this.options.runner.query != null, 'query is required');
    return this.options as Pick<Options<'datalake', O>, 'importer' | 'runner'>;
  }

  public intoIntegrationType(): IntegrationTypes.IntegrationTypes {
    const options = this.assertedOptions();
    return {
      type: 'datalake',
      ...options.runner,
    };
  }

  protected get computerImportType(): Importer['type'] {
    // we fake this so that the computer can import the result as a table
    return 'mySql';
  }

  protected async fetchData(computer: Computer): Promise<Uint8Array> {
    const options = this.assertedOptions();

    const variables = getVariablesFromComputer(computer);

    const appliedQuery = applyToTemplate(options.runner.query, variables);

    console.debug('DataLakeRunner: query:');
    console.debug(appliedQuery);

    const res = await fetch('/api/datalakes/query', {
      body: JSON.stringify({
        notebookId: this.padId,
        query: appliedQuery,
        time: options.runner.time || new Date().setMinutes(60, 0, 0),
      }),
      method: 'POST',
    });

    if (!res.ok) {
      const msg = (await res.json()) || {};
      if (msg.data?.preparedQuery) {
        console.error('DataLakeRunner: preparedQuery:');
        console.error(msg.data.preparedQuery);
      }
      throw new Error(
        `Failed to fetch SQL data - ${
          msg.message ?? `got status ${res.status}`
        }`
      );
    }

    return res.arrayBuffer().then((arr) => new Uint8Array(arr));
  }

  public getUsedVariableIds(computer: Computer): Array<string> {
    const { query } = this.options.runner;
    assert(query != null);

    const variables = getTemplateVariables(query);

    const undefinedVariables = variables.filter(
      (v) => computer.getVarResult(v) == null
    );

    if (undefinedVariables.length > 0) {
      return [];
    }

    return getTemplateVariables(query);
  }

  protected async fetchSchema(): Promise<JSONSchema | undefined> {
    const res = await fetch(`/api/datalakes/schema?notebookId=${this.padId}`, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch schema - ${res.statusText}`);
    }

    return res.json();
  }
}
