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
import { hydrateType, safeNumberForPrecision } from '@decipad/remote-computer';
import { BackendUrl, assertInstanceOf } from '@decipad/utils';
import DeciNumber from '@decipad/number';
import { Computer } from '@decipad/computer-interfaces';
import { getNotebookStore } from '@decipad/notebook-state';
import { LiveConnectionWorker } from '@decipad/live-connect';
import { pushResultToComputer } from '@decipad/computer-utils';
import { dateSpecificityToWasm } from '@decipad/compute-backend-js';

type TypeArray = Array<SimpleTableCellType | undefined>;

export type UnsubscribeFn = () => void;

export type ImportUnsubscribe = () => void;

export interface GenericRunner {
  import: () => Promise<string | undefined | Error>;

  getRawResult: () => string;
  getLatestResult: () => Result.Result | undefined;
}

export abstract class GenericContainerRunner implements GenericRunner {
  protected types: TypeArray;
  private rawResult: string;
  private latestResult: Result.Result | undefined;
  private isFirstRowHeader: boolean;

  protected name: string;
  protected id: string;

  constructor(name: string, id: string, types?: TypeArray) {
    this.name = name;
    this.id = id;
    this.types = [];
    if (types != null) {
      this.setTypes(types);
    }

    this.rawResult = '';
    this.isFirstRowHeader = false;
  }

  public getName(): string {
    return this.name;
  }
  public setName(name: string) {
    this.name = name;
  }
  public getId(): string {
    return this.id;
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

  public async import(): Promise<string | undefined | Error> {
    throw new Error('Cannot direclty use abstract methods import function');
  }
}

export class CSVRunner extends GenericContainerRunner implements GenericRunner {
  private url: string;

  // private source: ImportElementSource;
  private proxy: string | undefined;

  private resourceName: string | undefined;

  private padId: string | undefined;

  // TODO, this sucks, change to object
  constructor(
    name: string,
    id: string,
    url?: string,
    types?: TypeArray,
    padId?: string
  ) {
    super(name, id, types);

    this.url = url ?? '';
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

  public getResourceName(): string | undefined {
    return this.resourceName;
  }

  public setResourceName(resourceName: string | undefined): void {
    this.resourceName = resourceName;
  }

  public async import(): Promise<string | undefined> {
    const computer = getNotebookStore(this.padId!).getState().computer!;

    const buf = await fetch(this.url).then((res) => res.arrayBuffer());
    const data = new Uint8Array(buf);

    return computer.importExternalData({
      data,
      name: this.name,
      id: this.id,
      importer: {
        type: 'csv',
        isFirstHeaderRow: this.getIsFirstRowHeader(),
      },
      // this.types can have empty spots in it which apparently can't be mapped over,
      // so we spread ([...x]) it....
      // javascript actually needs to be burned to the ground
      types:
        this.types &&
        [...this.types].map((t) => {
          if (!t) return { type: { type: 'string' } };
          switch (t.kind) {
            case 'date':
              return {
                type: {
                  type: t.kind,
                  specificity: dateSpecificityToWasm(t.date),
                },
              };
            case 'string':
            case 'number':
            case 'boolean':
              return {
                type: { type: t.kind },
                unit: 'unit' in t ? t.unit ?? undefined : undefined,
              };
            default:
              return { type: { type: 'string' } };
          }
        }),
    });
  }
}

const getVariablesFromComputer = (computer: Computer): Record<string, any> => {
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
      case 'date': {
        if (typeof res.result.value !== 'bigint') {
          break;
        }
        const date = new Date(Number(res.result.value));
        resultMap[varName] = date;
      }
    }
  }

  return resultMap;
};

// Matches on {{var_name}} etc.
export const varIdentifierRegex = /{{\s*([_$a-z][_$a-z0-9]*)\s*}}/gi;

export class LegacyRunner
  extends GenericContainerRunner
  implements GenericRunner
{
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
    name: string,
    id: string,
    worker: LiveConnectionWorker,
    url?: string,
    types?: TypeArray,
    source?: ImportElementSource,
    padId?: string
  ) {
    super(name, id, types);

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

  public async import(): Promise<string | Error | undefined> {
    const worker = await this.getWorker();

    return new Promise<string | Error | undefined>((resolve, _reject) => {
      const computer = getNotebookStore(this.padId!).getState().computer!;
      const variables = getVariablesFromComputer(computer);

      const identifiers = [...this.query.matchAll(varIdentifierRegex)];

      const newQuery = identifiers.reduceRight((query, identifier) => {
        const offset = identifier.index;
        if (offset === undefined) {
          return query;
        }
        const variableName = identifier[1];
        const variable = variables[variableName];
        if (!variable) {
          throw new Error(`Variable ${variable} is not defined.`);
        }
        const fullMatch = identifier[0];

        let variableString: string;
        switch (typeof variable) {
          case 'string': {
            variableString = `'${variable.replace(/'/g, "''")}'`;
            break;
          }
          case 'number':
          case 'boolean': {
            variableString = variable.toString();
            break;
          }
          case 'object': {
            if ((variable as any) instanceof Date) {
              variableString = `'${(variable as Date).toISOString()}'`;
              break;
            }

            throw new Error(`Variable ${variableName} has wrong type.`);
          }
          default: {
            throw new Error(`Variable ${variableName} has wrong type.`);
          }
        }

        return `${query.slice(0, offset)}${variableString}${query.slice(
          offset + fullMatch.length
        )}`;
      }, this.query);

      const unsubPromise = worker.subscribe(
        {
          useFirstRowAsHeader: this.getIsFirstRowHeader(),
          query: newQuery,
          url: this.url,
          columnTypeCoercions: this.getSubscribeTypes(),
          proxy: this.proxy,
          source: this.source,
          maxCellCount: 10_000_000_000_000,
          useCache: this.source === 'csv',
          padId: this.padId,
          pollIntervalSeconds: -1, // disable polling
        },
        async (error, __, res) => {
          if (error) {
            (await unsubPromise)();
            return resolve(error);
          }
          if (res.loading == null || res.loading || !res.result) {
            return;
          }

          this.setLatestResult(res.result);
          await pushResultToComputer(computer, this.id, this.name, res.result);

          resolve(this.id);
          (await unsubPromise)();
        }
      );
    });
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
    name: string,
    id: string,
    code?: string,
    types?: TypeArray
  ) {
    super(name, id, types);

    this.code = code ?? codePlaceholder();
    this.computer = computer;

    this.worker = new SafeJs(
      () => {},
      () => {},
      { fetchProxyUrl: BackendUrl.fetchProxy(notebookId).toString() }
    );
  }

  private getComputerVariables(): Record<string, any> {
    return getVariablesFromComputer(this.computer);
  }

  public async import(): Promise<string | Error | undefined> {
    try {
      const value = await this.worker.execute(
        this.code,
        this.getComputerVariables()
      );

      if (value instanceof Error || value == null) {
        return value;
      }
      const result = await importFromJSONAndCoercions(
        this.computer,
        value,
        this.getTypes()
      );
      await pushResultToComputer(this.computer, this.id, this.name, result);
      this.setLatestResult(result);
      return this.id;
    } catch (err: unknown) {
      assertInstanceOf(err, Error);
      return err;
    }
  }

  public deinit(): void {
    this.worker.kill();
  }
}
