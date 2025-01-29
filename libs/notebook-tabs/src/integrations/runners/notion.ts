import { IntegrationTypes } from '@decipad/editor-types';
import { Options, Runner } from './runner';
import { assert } from '@decipad/utils';
import { importFromNotion } from '@decipad/import';

type T = 'notion';
type O = Omit<IntegrationTypes.NotionBlockIntegration, 'type'>;

export class NotionRunner extends Runner<T, O> {
  public type = 'notion' as const;

  public resourceName: string | undefined = undefined;
  public setResourceName(resourceName: string) {
    this.resourceName = resourceName;
  }

  public assertedOptions(): Pick<Options<'notion', O>, 'runner' | 'importer'> {
    assert(this.options.runner.notionUrl != null);

    return this.options as Pick<Options<'notion', O>, 'runner' | 'importer'>;
  }

  public intoIntegrationType(): IntegrationTypes.IntegrationTypes {
    const options = this.assertedOptions();
    return {
      type: 'notion',
      ...options.runner,
    };
  }

  public getUsedVariableIds(): Array<string> {
    return [];
  }

  protected async fetchData(): Promise<Uint8Array> {
    const options = this.assertedOptions();
    const res = await fetch(options.runner.notionUrl);
    const json = await res.json();

    if (res.status !== 200) {
      console.error('failed to get notion data: ', json);
      throw new Error(
        `Failed to fetch Notion data - got status code ${res.status}`
      );
    }

    const [importedNotion] = importFromNotion(json);
    return new Uint8Array(Buffer.from(JSON.stringify(importedNotion)));
  }
}
