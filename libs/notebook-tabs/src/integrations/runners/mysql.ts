import { assert } from '@decipad/utils';
import { Options, Runner } from './runner';
import { IntegrationTypes } from '@decipad/editor-types';
import { getVariablesFromComputer } from '@decipad/computer-utils';
import { applyToTemplate, getTemplateVariables } from './utils';
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

  public getUsedVariableIds(computer: Computer): Array<string> {
    const { query } = this.options.runner;
    assert(query != null);

    const variables = getTemplateVariables(query);

    const undefinedVariables = variables.filter(
      (v) => computer.getVarResult(v) == null
    );

    if (undefinedVariables.length > 0) {
      throw new Error(
        `Not all variables are defined. Undefined variables: \n${undefinedVariables.join(
          '\n'
        )}`
      );
    }

    return getTemplateVariables(query);
  }

  protected async fetchData(computer: Computer): Promise<Uint8Array> {
    const options = this.assertedOptions();

    const variables = getVariablesFromComputer(computer);
    const queryWithVariables = applyToTemplate(options.runner.query, variables);

    const res = await fetch(options.runner.url, {
      body: queryWithVariables,
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
