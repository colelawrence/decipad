import {
  dateSpecificityToWasm,
  DeciType,
  Importer,
} from '@decipad/compute-backend-js';
import { pushExtraData, pushResultNameChange } from '@decipad/computer-utils';
import { filterExpression } from '@decipad/editor-language-elements';
import { Filter, SimpleTableCellType } from '@decipad/editor-types';
import { getNotebookStore } from '@decipad/notebook-state';
import { astNode, hydrateType, Unknown } from '@decipad/remote-computer';
import { assert } from '@decipad/utils';
import {
  IntegrationTypes,
  TypeMap,
  TypeObject,
} from 'libs/editor-types/src/integrations';

type ImporterTypes = Importer['type'];
export type Options<T extends ImporterTypes, O extends Record<string, any>> = {
  name?: string;
  /** Options specific to the WASM-land importer */
  importer: Omit<GenericImportOptions<T>['importer'], 'type'>;
  /** Options specific to the JS-land runner */
  runner: O;
  padId: string;
  filters: Filter[];
  /** Desired column types for inference.
   *
   * If a column is not defined, its type will be guessed.
   * If this field is `undefined`, every column's type will be guessed. */
  types?: TypeMap;
};

export type PartialOptions<
  T extends ImporterTypes,
  O extends Record<string, any>
> = Omit<Options<T, O>, 'runner'> & {
  runner: Partial<Options<T, O>['runner']>;
};

type GenericImportOptions<T extends ImporterTypes> = {
  importer: Extract<Importer, { type: T }>;
};

export const isRunnerOfType = <T extends ImporterTypes>(
  runner: Runner,
  typ: T
): runner is Runner<T> => runner.type === typ;

export abstract class Runner<
  T extends ImporterTypes = ImporterTypes,
  O extends Record<string, any> = Record<string, any>
> {
  public abstract readonly type: T;
  protected _types: TypeMap = {};

  public name: string | undefined;

  protected _id: string;
  public get id(): string {
    return this._id;
  }

  protected padId: string;
  public options: Pick<PartialOptions<T, O>, 'runner' | 'importer'>;

  private _nameToColumnId: Record<string, string | undefined> | undefined =
    undefined;

  public filters: Filter[];

  constructor(
    id: string,
    { name, types, importer, padId, runner, filters }: PartialOptions<T, O>
  ) {
    this.name = name;
    this._id = id;

    this.options = { importer, runner };
    this.padId = padId;

    this.filters = filters;

    if (types != null) {
      this.setTypes(types);
    }
  }

  public setOptions(options: Partial<Runner<T, O>['options']>) {
    this.options = {
      runner: {
        ...this.options.runner,
        ...options.runner,
      },
      importer: {
        ...this.options.importer,
        ...options.importer,
      },
    };
  }

  public get nameToColumnId() {
    return this._nameToColumnId;
  }

  public async renameColumn(
    currentColumnName: string,
    desiredColumnName: string
  ): Promise<void> {
    assert(this._nameToColumnId != null);

    const sanitizedColumnName = desiredColumnName.replaceAll(
      /[^A-z0-9_-]/g,
      ''
    );

    if (this.nameToColumnId == null) {
      throw new Error(
        'You cant call this function if no import has taken place'
      );
    }

    const columnId = this.nameToColumnId[currentColumnName];
    if (columnId == null) {
      throw new Error('We are out of sync, something wrong :(');
    }

    const type = { ...(this._types[columnId] ?? {}) };
    type.desiredName = sanitizedColumnName;

    this.setTypeAt(columnId, type);

    const computer = getNotebookStore(this.padId).getState().computer!;

    await pushResultNameChange(computer, this.id, sanitizedColumnName, {
      type: 'column',
      originalColumnName: columnId,
      tableId: this.id,
      tableName: this.name!,
    });

    delete this._nameToColumnId[currentColumnName];
    this._nameToColumnId[sanitizedColumnName] = columnId;
  }

  public setTypeAt(name: string, type: TypeObject): void {
    // I hate this.
    // React keeps freezing the objects and we get weird errors if we
    // mutate....
    const rebuiltTypes = structuredClone(this._types);
    rebuiltTypes[name] = structuredClone(type);

    this.setTypes(rebuiltTypes);
  }

  public setTypes(types: TypeMap): void {
    const rebuiltTypes = structuredClone(types);

    for (const [columnName, columnType] of Object.entries(types)) {
      if (columnType == null) {
        continue;
      }

      rebuiltTypes[columnName] = {
        ...columnType,
        type:
          columnType.type &&
          (hydrateType(columnType.type) as SimpleTableCellType),
      };
    }

    this._types = rebuiltTypes;
  }

  public setColumnType(
    name: string,
    type: SimpleTableCellType | undefined
  ): void {
    const rebuiltTypes = { ...this._types };

    const originalName =
      Object.entries(rebuiltTypes).find(
        ([_, t]) => t?.desiredName === name
      )?.[0] ?? name;

    const existingType = rebuiltTypes[originalName];

    rebuiltTypes[originalName] = {
      ...existingType,
      type: type && (hydrateType(type) as SimpleTableCellType),
    };

    this._types = rebuiltTypes;
  }

  public get types(): TypeMap {
    return this._types;
  }

  protected abstract fetchData(): Promise<Uint8Array>;

  public abstract assertedOptions(): Pick<Options<T, O>, 'runner' | 'importer'>;
  public abstract intoIntegrationType(): IntegrationTypes;

  public async import(): Promise<string> {
    assert(!!this.name);
    const options = this.assertedOptions();
    const computer = getNotebookStore(this.padId).getState().computer!;

    // TODO: Is this correct? I think we need more on program field.
    // Also clean up on errors.
    await computer.pushComputeDelta({
      program: {
        upsert: [
          {
            id: this._id,
            type: 'identified-block',
            block: {
              id: this._id,
              type: 'block',
              args: [
                astNode(
                  'assign',
                  astNode('def', this.name),
                  astNode('externalref', this._id)
                ),
              ],
            },
          },
        ],
      },
      external: {
        upsert: {
          [this._id]: {
            type: { kind: 'pending' },
            value: Unknown,
            meta: undefined,
          },
        },
      },
    });

    const data = await this.fetchData();

    const importedResult = await computer.importExternalData({
      data,
      name: this.name,
      id: this._id,
      importer: { type: this.type, ...options.importer } as Importer,

      importOptions: {
        column_types: Object.fromEntries(
          Object.entries(this._types)
            .map(([k, v]) => {
              if (!v || !v.type) return undefined;
              const { type: t } = v;
              switch (t.kind) {
                case 'date':
                  return [
                    k,
                    {
                      type: t.kind,
                      specificity: dateSpecificityToWasm(t.date),
                    },
                  ];
                case 'number':
                  return [k, { type: t.kind }];
                case 'string':
                case 'boolean':
                  return [k, { type: t.kind }];
                default:
                  return [k, { type: 'string' }];
              }
            })
            .filter((i): i is [string, DeciType] => !!i)
        ),
      },
      metaColumnOptions: Object.fromEntries(
        Object.entries(this._types).map(([k, v]) => {
          if (!v) return [k, undefined];
          const { type } = v;
          return [
            k,
            {
              ...v,
              unit: type && 'unit' in type ? type.unit ?? undefined : undefined,
            },
          ];
        })
      ),
    });

    //
    // Some documentation.
    //
    // To keep the ID's consistent we are making the assumption the data that comes to us has
    // unique column names. And therefore these can be the stable ID's for the columns.
    //
    // When we rename a column we must keep track of that original name, to create an ID.
    //

    // TODO: this jank
    const nonHiddenColumns: Record<string, string> = {};
    for (const [k, v] of Object.entries(importedResult.columnNamesToId)) {
      if (k in this.types && this.types[k]!.isHidden) {
        continue;
      }

      nonHiddenColumns[k] = v;
    }

    await pushExtraData(
      computer,
      this.id,
      this.name,
      Object.values(nonHiddenColumns),
      Object.keys(nonHiddenColumns),
      filterExpression(this.filters)
    );

    this._nameToColumnId = importedResult.columnNamesToId;

    return importedResult.id;
  }

  public async rename(newName: string): Promise<void> {
    const computer = getNotebookStore(this.padId).getState().computer!;

    return pushResultNameChange(computer, this.id, newName, {
      type: 'table',
      columnNameToIds: this.nameToColumnId ?? {},
      columnsToHide: Object.entries(this._types)
        .filter(([, v]) => v?.isHidden)
        .map(([k]) => k),
    });
  }
}
