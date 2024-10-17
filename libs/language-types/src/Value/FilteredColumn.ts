import { first } from '@decipad/generator-utils';
import { FilteredColumn as FilteredColumnBase } from '@decipad/column';
import { once } from '@decipad/utils';
import type { Result, Value } from '@decipad/language-interfaces';
import { isColumnLike } from './ColumnLike';
import { columnValueToResultValue } from '../utils/columnValueToResultValue';
import { getLabelIndex } from '../Dimension/getLabelIndex';
import { lowLevelGet } from './lowLevelGet';
import { lowLowLevelGet } from './lowLowLevelGet';

export class FilteredColumn
  extends FilteredColumnBase<Value.Value>
  implements Value.ColumnLikeValue
{
  private sourceColumn2: Value.ColumnLikeValue;

  meta: undefined | (() => Result.ResultMetadataColumn);

  constructor(column: Value.ColumnLikeValue, map: boolean[]) {
    super(column, map);
    this.sourceColumn2 = column;
    this.meta = () => ({
      labels: column.meta?.()?.labels?.then((labels) => {
        const [thisLabel, ...restLabels] = labels ?? [];
        return [thisLabel?.filter((_, i) => map[i]), ...restLabels];
      }),
    });
  }

  async getData(): Promise<Result.OneResult> {
    return columnValueToResultValue(this);
  }

  async lowLevelGet(...keys: number[]) {
    return lowLevelGet(await this.atIndex(keys[0]), keys.slice(1));
  }

  async lowLowLevelGet(...keys: number[]) {
    return lowLowLevelGet(
      await (await this.atIndex(keys[0]))?.getData(),
      keys.slice(1)
    );
  }

  async dimensions() {
    const contents = first(this.values());

    return [
      { dimensionLength: once(async () => this.rowCount()) },
      ...(isColumnLike(contents) ? await contents.dimensions() : []),
    ];
  }

  async indexToLabelIndex(filteredIndex: number) {
    const sourceIndex = this.getSourceIndex(filteredIndex);
    return getLabelIndex(this.sourceColumn2, sourceIndex);
  }

  static fromColumnValueAndMap(
    column: Value.ColumnLikeValue,
    map: boolean[]
  ): FilteredColumn {
    return new FilteredColumn(column, map);
  }
}
