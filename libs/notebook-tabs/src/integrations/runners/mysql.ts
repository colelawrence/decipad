import { assert } from '@decipad/utils';
import { Options, Runner } from './runner';
import { IntegrationTypes } from '@decipad/editor-types';
import { getVariablesFromComputer } from '@decipad/computer-utils';
import { applyToTemplate } from './utils';
import { Computer } from '@decipad/computer';

/** Matches on `{{var_name}}` etc. */
export const varIdentifierRegex = /{{\s*([_$a-z][_$a-z0-9]*)\s*}}/gi;

type T = 'mySql';
type O = Omit<IntegrationTypes.SQLBlockIntegration, 'type'>;
export class SQLRunner extends Runner<T, O> {
  public readonly type = 'mySql' as const;

  public resourceName: string | undefined = undefined;

  public assertedOptions(): Pick<Options<'mySql', O>, 'runner' | 'importer'> {
    assert(
      this.options.runner.url != null && this.options.runner.query != null
    );

    return this.options as Pick<Options<'mySql', O>, 'runner' | 'importer'>;
  }

  public intoIntegrationType(): IntegrationTypes.IntegrationTypes {
    const options = this.assertedOptions();
    return {
      type: 'mysql',
      ...options.runner,
    };
  }

  protected async fetchData(computer: Computer): Promise<Uint8Array> {
    const options = this.assertedOptions();

    const variables = getVariablesFromComputer(computer);

    const res = await fetch(options.runner.url, {
      body: applyToTemplate(options.runner.query, variables),
      method: 'POST',
    });

    if (res.status !== 200) {
      const msg = (await res.json()) || {};
      throw new Error(
        `Failed to fetch SQL data - ${
          msg.message ?? `got status ${res.status}`
        }`
      );
    }

    return res.arrayBuffer().then((arr) => new Uint8Array(arr));
  }
}
