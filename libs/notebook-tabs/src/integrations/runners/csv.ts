import { assert } from '@decipad/utils';
import { Options, Runner } from './runner';
import { CSVIntegration } from 'libs/editor-types/src/integrations';
import { IntegrationTypes } from '@decipad/editor-types';
import { Computer } from '@decipad/computer-interfaces';

type T = 'csv';
type O = Omit<CSVIntegration, 'type'>;
export class CSVRunner extends Runner<T, O> {
  public readonly type = 'csv' as const;

  public resourceName: string | undefined = undefined;
  public setResourceName(resourceName: string) {
    this.resourceName = resourceName;
  }

  public assertedOptions(): Pick<Options<T, O>, 'runner' | 'importer'> {
    assert(this.options.runner.csvUrl !== undefined);

    return this.options as Pick<Options<T, O>, 'runner' | 'importer'>;
  }
  public intoIntegrationType(): IntegrationTypes.IntegrationTypes {
    const options = this.assertedOptions();
    return {
      type: 'csv',
      ...options.runner,
    };
  }

  public getUsedVariableIds(): Array<string> {
    return [];
  }

  protected fetchData(
    _computer: Computer,
    abortController?: AbortController
  ): Promise<Uint8Array> {
    const options = this.assertedOptions();
    return fetch(options.runner.csvUrl, { signal: abortController?.signal })
      .then((res) => res.arrayBuffer())
      .then((res) => new Uint8Array(res));
  }
}
