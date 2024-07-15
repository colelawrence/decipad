/* eslint-disable prefer-destructuring */
import {
  ImportElementSource,
  SimpleTableCellType,
  TableCellType,
} from '@decipad/editor-types';
import { codePlaceholder } from '@decipad/frontend-config';
import { importFromJSONAndCoercions } from '@decipad/import';
import { Result } from '@decipad/language-interfaces';
import { SafeJs } from '@decipad/safejs';
import { BackendUrl, assertInstanceOf } from '@decipad/utils';
import { LiveConnectionWorker } from 'libs/live-connect/src/types';
import {
  hydrateResult,
  hydrateType,
  safeNumberForPrecision,
} from '@decipad/remote-computer';
import DeciNumber from '@decipad/number';
import { Computer } from '@decipad/computer-interfaces';

type TypeArray = Array<SimpleTableCellType | undefined>;

export interface GenericRunner {
  import: () => Promise<Result.Result | Error | undefined>;

  getRawResult: () => string;
  getLatestResult: () => Result.Result | undefined;
}

export abstract class GenericContainerRunner implements GenericRunner {
  private types: TypeArray;
  private rawResult: string;
  private latestResult: Result.Result | undefined;
  private isFirstRowHeader: boolean;

  constructor(types?: TypeArray) {
    this.types = [];
    if (types != null) {
      this.setTypes(types);
    }

    this.rawResult = '';
    this.isFirstRowHeader = false;
  }

  public getRawResult(): string {
    return this.rawResult;
  }

  public getLatestResult(): Result.Result | undefined {
    return this.latestResult;
  }

  public setLatestResult(res: Result.Result | undefined): void {
    this.latestResult = res;
  }

  public setTypes(types: TypeArray): void {
    this.types = types.map((t) =>
      t ? (hydrateType(t) as SimpleTableCellType) : t
    );
  }

  public setTypeIndex(
    index: number,
    type: SimpleTableCellType | undefined
  ): void {
    const typeCopy = [...this.types];
    typeCopy[index] = type ? (hydrateType(type) as SimpleTableCellType) : type;

    this.setTypes(typeCopy);
  }

  public getIsFirstRowHeader(): boolean {
    return this.isFirstRowHeader;
  }

  public setIsFirstRowHeader(value: boolean): void {
    this.isFirstRowHeader = value;
  }

  public getSubscribeTypes(): Record<number, TableCellType> {
    const typeRecord: Record<number, TableCellType> = {};

    for (const [index, t] of this.getTypes().entries()) {
      if (t == null) {
        continue;
      }

      typeRecord[index] = t;
    }

    return typeRecord;
  }

  public getTypes(): TypeArray {
    return this.types.map((t) =>
      t != null ? (hydrateType(t) as SimpleTableCellType) : t
    );
  }

  public async import(): Promise<Result.Result | Error | undefined> {
    throw new Error('Cannot direclty use abstract methods import function');
  }
}

export class URLRunner extends GenericContainerRunner implements GenericRunner {
  // Specific to CSV
  private url: string;

  // Generic to any runner
  private worker: LiveConnectionWorker;

  private source: ImportElementSource;
  private proxy: string | undefined;

  /**
   * Optional logic for GSheets only.
   *
   * It's kind of annoying to store all the info in the URL. TODO though, not very nice
   */
  private subId: { id: string | number; name: string } | undefined;
  private resourceName: string | undefined;

  /**
   * Optional for SQL only
   * Getting a small problem where this URLRunner is trying to do too much.
   */
  private query: string;

  private padId: string | undefined;

  // TODO, this sucks, change to object
  constructor(
    worker: LiveConnectionWorker,
    url?: string,
    types?: TypeArray,
    source?: ImportElementSource,
    padId?: string
  ) {
    super(types);

    this.worker = worker;
    this.url = url ?? '';
    this.source = source ?? 'csv';
    this.query = '';
    this.padId = padId;
  }

  public setUrl(url: string): void {
    this.url = url;
  }

  public getUrl(): string {
    return this.url;
  }

  public getProxy(): string | undefined {
    return this.proxy;
  }

  public setProxy(proxy: string | undefined): void {
    this.proxy = proxy;
  }

  public getSubId(): { id: string | number; name: string } | undefined {
    return this.subId;
  }

  public setSubId(subId: { id: string | number; name: string }): void {
    this.subId = subId;
  }

  public getResourceName(): string | undefined {
    return this.resourceName;
  }

  public setResourceName(resourceName: string | undefined): void {
    this.resourceName = resourceName;
  }

  public getQuery(): string {
    return this.query;
  }

  public setQuery(query: string): void {
    this.query = query;
  }

  private async getWorker(): Promise<LiveConnectionWorker> {
    return this.worker;
  }

  public async import(): Promise<Result.Result | undefined> {
    const worker = await this.getWorker();

    let resolveProm: (_: Result.Result | undefined) => void = () => {};

    const resultPromise = new Promise<Result.Result | undefined>((resolve) => {
      resolveProm = resolve;
    });

    const unsubPromise = worker.subscribe(
      {
        useFirstRowAsHeader: this.getIsFirstRowHeader(),
        query: this.query,

        url: this.url,
        columnTypeCoercions: this.getSubscribeTypes(),
        proxy: this.proxy,
        source: this.source,
        maxCellCount: 10_000_000_000_000,
        useCache: this.source === 'csv',
        padId: this.padId,
      },
      async (_, __, res) => {
        if (res.loading == null || res.loading) {
          return;
        }
        const unsubValue = await unsubPromise;

        const hydratedResult = hydrateResult(res.result);

        this.setLatestResult(hydratedResult);
        resolveProm(hydratedResult);
        unsubValue();
      }
    );

    return resultPromise;
  }
}

export class CodeRunner
  extends GenericContainerRunner
  implements GenericRunner
{
  private worker: SafeJs;
  private computer: Computer;

  public code: string;

  constructor(
    notebookId: string,
    computer: Computer,
    code?: string,
    types?: TypeArray
  ) {
    super(types);

    this.code = code ?? codePlaceholder();
    this.computer = computer;

    this.worker = new SafeJs(
      () => {},
      () => {},
      { fetchProxyUrl: BackendUrl.fetchProxy(notebookId).toString() }
    );
  }

  private getComputerVariables(): Record<string, any> {
    const notebookResults = this.computer.results$.get();
    const resultMap: Record<string, any> = {};

    for (const res of Object.values(notebookResults.blockResults)) {
      if (res.type === 'identified-error') {
        continue;
      }

      const varName = this.computer.getSymbolDefinedInBlock(res.id);
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

  public async import(): Promise<Result.Result | Error | undefined> {
    try {
      const value = await this.worker.execute(
        this.code,
        this.getComputerVariables()
      );

      if (value instanceof Error || value == null) {
        return undefined;
      }

      const result = await importFromJSONAndCoercions(
        this.computer,
        value,
        this.getTypes()
      );
      this.setLatestResult(result);

      return result;
    } catch (err: unknown) {
      assertInstanceOf(err, Error);

      return err;
    }
  }

  public deinit(): void {
    this.worker.kill();
  }
}
