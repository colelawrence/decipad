import { first } from '@decipad/generator-utils';
import { FilteredColumn as FilteredColumnBase } from '@decipad/column';
import { isColumnLike, type ColumnLikeValue } from './ColumnLike';
import type { Value } from './Value';
import { columnValueToResultValue } from '../utils/columnValueToResultValue';
import { getLabelIndex } from '../Dimension/getLabelIndex';
import { lowLevelGet } from './lowLevelGet';
import type { OneResult } from '../Result';

export class FilteredColumn
  extends FilteredColumnBase<Value>
  implements ColumnLikeValue
{
  private sourceColumn2: ColumnLikeValue;

  constructor(column: ColumnLikeValue, map: boolean[]) {
    super(column, map);
    this.sourceColumn2 = column;
  }

  async getData(): Promise<OneResult> {
    return columnValueToResultValue(this);
  }

  async lowLevelGet(...keys: number[]) {
    return lowLevelGet(await this.atIndex(keys[0]), keys.slice(1));
  }

  async dimensions() {
    const contents = first(this.values());

    if (isColumnLike(contents)) {
      return [
        { dimensionLength: await this.rowCount() },
        ...(await contents.dimensions()),
      ];
    } else {
      return [{ dimensionLength: await this.rowCount() }];
    }
  }

  static fromColumnValueAndMap(
    column: ColumnLikeValue,
    map: boolean[]
  ): FilteredColumn {
    return new FilteredColumn(column, map);
  }

  async indexToLabelIndex(filteredIndex: number) {
    const sourceIndex = this.getSourceIndex(filteredIndex);
    return getLabelIndex(this.sourceColumn2, sourceIndex);
  }
}
