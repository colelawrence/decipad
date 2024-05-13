import { RuntimeError } from '../RuntimeError';
import type {
  GenericResultGenerator,
  OneResult,
  ResultGenerator,
} from '../Result';
import type { TableValue } from './TableValue';
import { count, first, map, slice, unzip } from '@decipad/generator-utils';
import { GeneratorColumn } from './GeneratorColumn';
import type { Type } from '..';
import { typedResultToValue } from '../utils/typedResultToValue';
import {
  fromGeneratorFunctionPromiseToGeneratorFunction,
  fromGeneratorFunctionsPromiseToGeneratorFunctions,
} from '../utils/fromGeneratorFunctionPromiseToGeneratorFunction';

type TableRowGenerator = (
  start?: number,
  end?: number
) => AsyncGenerator<OneResult[]>;

export class GeneratorTable implements TableValue {
  generateRows: TableRowGenerator;
  columnNames: string[];
  columnTypes: Type[];

  constructor(
    generateRows: TableRowGenerator,
    columnNames: string[],
    columnTypes: Type[]
  ) {
    this.generateRows = generateRows;
    this.columnNames = columnNames;
    this.columnTypes = columnTypes;
  }

  static fromNamedColumns(
    gen: TableRowGenerator,
    columnNames: string[] = [],
    columnTypes: Type[] = []
  ) {
    if (columnNames.length !== columnTypes.length) {
      throw new Error(
        `Column count mismatch: column types (${columnTypes.length}) and column names (${columnNames.length}) do not match`
      );
    }
    return new GeneratorTable(gen, columnNames, columnTypes);
  }

  async tableRowCount(): Promise<number | undefined> {
    return count(this.generateRows());
  }

  getColumn(name: string) {
    const index = this.columnNames.indexOf(name);
    if (index < 0) {
      throw new RuntimeError(`Missing column ${name}`);
    }

    const colGenPromise = typedResultToValue(this.columnTypes[index]).then(
      async (value) => this.getColumnOneResultGenFunction(index, value)
    );
    return GeneratorColumn.fromGenerator(
      fromGeneratorFunctionPromiseToGeneratorFunction(colGenPromise),
      `GeneratorTable<${this.columnNames.join(',')}>`
    );
  }

  get columns() {
    const genFnsPromises = this.columnTypes.map(typedResultToValue);
    const genFns = Promise.all(genFnsPromises).then(async (convFns) =>
      this.getColumnsOneResultGenFunctions(convFns)
    );
    const generators = fromGeneratorFunctionsPromiseToGeneratorFunctions(
      genFns,
      this.columnTypes.length
    );
    if (generators.length !== this.columnTypes.length) {
      throw new RuntimeError('Column count mismatch');
    }
    return this.columnTypes.map((_, index) =>
      GeneratorColumn.fromGenerator(
        generators[index],
        `GeneratorTable<${this.columnNames.join(',')}>`
      )
    );
  }

  private async getColumnsOneResultGenFunctions<T>(
    mapFns: ((result: OneResult) => T)[]
  ) {
    return first(unzip(this.generateRows(), this.columnNames.length)).then(
      (colGens) =>
        colGens.map(
          (colGen, index) =>
            (start = 0, end = Infinity) =>
              map(slice(colGen, start, end), mapFns[index])
        )
    );
  }

  private async getColumnOneResultGenFunction<T>(
    index: number,
    mapFn: (result: OneResult) => T
  ): Promise<GenericResultGenerator<T>> {
    return first(unzip(this.generateRows(), this.columnNames.length)).then(
      (colGens) => {
        const colGen = colGens[index];
        if (!colGen) {
          throw new Error(`Column index ${index} out of bounds`);
        }
        return (start = 0, end = Infinity) =>
          map(slice(colGen, start, end), mapFn);
      }
    );
  }

  async getData(): Promise<ResultGenerator[]> {
    // we need to transform the data from row-oriented to column-oriented
    // here, unzip emits an array of generators as its first and sole value, each of which emits a column
    return first(unzip(this.generateRows(), this.columnNames.length)).then(
      (colGens) =>
        colGens.map(
          (colGen): ResultGenerator =>
            (start = 0, end = Infinity) =>
              slice(colGen, start, end)
        )
    );
  }
}
