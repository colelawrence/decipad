import { first } from '@decipad/generator-utils';
import { MappedColumn as MappedColumnBase } from '@decipad/column';
import { isColumnLike, type ColumnLikeValue } from './ColumnLike';
import type { Value } from './Value';
import { Column } from './Column';
import type { OneResult } from '../Result';
import { columnValueToResultValue } from '../utils/columnValueToResultValue';
import { getLabelIndex } from '../Dimension/getLabelIndex';
import { columnValueToValueGeneratorFunction } from './columnValueToValueGeneratorFunction';
import { lowLevelGet } from './lowLevelGet';
import { once } from '@decipad/utils';

export class MappedColumn
  extends MappedColumnBase<Value>
  implements ColumnLikeValue
{
  private sourceColumn: ColumnLikeValue;

  constructor(source: ColumnLikeValue, map: number[]) {
    super(source, map);
    this.sourceColumn = source;
  }
  async getData(): Promise<OneResult> {
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
    column: ColumnLikeValue,
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
