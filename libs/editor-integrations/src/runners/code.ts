import { assert, BackendUrl } from '@decipad/utils';
import { Options, PartialOptions, Runner } from './runner';
import { Computer } from '@decipad/computer-interfaces';
import { getNotebookStore } from '@decipad/notebook-state';
import { SafeJs } from '@decipad/safejs';
import DeciNumber, { safeNumberForPrecision } from '@decipad/number';
import { codePlaceholder } from '@decipad/editor-utils';
import { importFromJSONAndCoercions } from '@decipad/import';
import { pushResultToComputer } from '@decipad/computer-utils';
import { IntegrationTypes } from '@decipad/editor-types';
import { Result, Unknown } from '@decipad/language-interfaces';

type T = 'code';
type O = Omit<IntegrationTypes.CodeBlockIntegration, 'type'>;
export class CodeRunner extends Runner<T, O> {
  public readonly type = 'code' as const;

  public resourceName: string | undefined = undefined;
  private worker: SafeJs;

  public assertedOptions(): Pick<Options<T, O>, 'runner' | 'importer'> {
    assert(
      this.options.importer.isFirstHeaderRow !== undefined &&
        this.options.runner.code !== undefined
    );

    return this.options as Pick<Options<T, O>, 'runner' | 'importer'>;
  }

  public intoIntegrationType(): IntegrationTypes.IntegrationTypes {
    const options = this.assertedOptions();
    return {
      type: 'codeconnection',
      ...options.runner,
    };
  }

  constructor(id: string, opts: PartialOptions<T, O>) {
    super(id, opts);
    this.options.runner.code ??= codePlaceholder();

    this.worker = new SafeJs(
      () => {},
      () => {},
      { fetchProxyUrl: BackendUrl.fetchProxy(this.padId).toString() }
    );
  }

  protected fetchData(): Promise<Uint8Array> {
    throw new Error('not used here');
  }

  private getComputerVariables(computer: Computer): Record<string, any> {
    const notebookResults = computer.results$.get();
    const resultMap: Record<string, any> = {};

    for (const res of Object.values(notebookResults.blockResults)) {
      if (res.type === 'identified-error') {
        continue;
      }

      const varName = computer.getSymbolDefinedInBlock(res.id);
      if (varName == null) {
        continue;
      }

      switch (res.result.type.kind) {
        case 'string':
        case 'boolean': {
          resultMap[varName] = res.result.value?.valueOf();
          break;
        }
        case 'number': {
          const [, valOf] = safeNumberForPrecision(
            res.result.value as DeciNumber
          );
          resultMap[varName] = valOf;
          break;
        }
      }
    }

    return resultMap;
  }
  override async import(): Promise<string> {
    assert(this.name !== undefined);
    const computer = getNotebookStore(this.padId).getState().computer!;
    const options = this.assertedOptions();
    const value = await this.worker.execute(
      options.runner.code,
      this.getComputerVariables(computer)
    );

    if (value instanceof Error || value == null) {
      const errorResult: Result.Result = {
        type: {
          kind: 'type-error',
          errorCause: {
            errType: 'free-form',
            message:
              value instanceof Error
                ? value.message
                : 'Nothing returned from JS.',
          },
        },
        value: Unknown,
      };

      await pushResultToComputer(computer, this.id, this.name, errorResult);

      return this.id;
    }
    const result = await importFromJSONAndCoercions(computer, value, []);
    await pushResultToComputer(computer, this.id, this.name, result);
    return this.id;
  }
}
