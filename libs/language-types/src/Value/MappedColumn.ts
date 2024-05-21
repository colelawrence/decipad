import { first } from '@decipad/generator-utils';
import { MappedColumn as MappedColumnBase } from '@decipad/column';
import { once } from '@decipad/utils';
import type { Result, Value } from '@decipad/language-interfaces';
import { isColumnLike } from './ColumnLike';
import { Column } from './Column';
import { columnValueToResultValue } from '../utils/columnValueToResultValue';
import { getLabelIndex } from '../Dimension/getLabelIndex';
import { columnValueToValueGeneratorFunction } from './columnValueToValueGeneratorFunction';
import { lowLevelGet } from './lowLevelGet';

export class MappedColumn
  extends MappedColumnBase<Value.Value>
  implements Value.ColumnLikeValue
{
  private sourceColumn: Value.ColumnLikeValue;

  constructor(source: Value.ColumnLikeValue, map: number[]) {
    super(source, map);
    this.sourceColumn = source;
  }
  async getData(): Promise<Result.OneResult> {
    return columnValueToResultValue(this);
  }

  async lowLevelGet(...keys: number[]) {
    return lowLevelGet(await this.atIndex(keys[0]), keys.slice(1));
  }

  async dimensions() {
    const contents = first(this.values());

    return [
      { dimensionLength: once(async () => this.rowCount()) },
      ...(isColumnLike(contents) ? await contents.dimensions() : []),
    ];
  }

  static fromColumnValueAndMap(
    column: Value.ColumnLikeValue,
    map: number[]
  ): MappedColumn {
    return new MappedColumn(
      Column.fromGenerator(
        columnValueToValueGeneratorFunction(column),
        `MappedColumn`
      ),
      map
    );
  }

  async indexToLabelIndex(mappedIndex: number) {
    return getLabelIndex(this.sourceColumn, this.map[mappedIndex]);
  }
}
