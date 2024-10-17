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
import { lowLowLevelGet } from './lowLowLevelGet';

export class MappedColumn
  extends MappedColumnBase<Value.Value, Value.ColumnLikeValue>
  implements Value.ColumnLikeValue
{
  meta(): Result.ResultMetadataColumn {
    const meta = this.source.meta?.bind(this.source);
    const { labels } = meta?.() ?? {};
    return {
      labels: labels?.then((labels) => {
        const [thisLabel, ...restLabels] = labels ?? [];
        return [this.map.map((index) => thisLabel[index]), ...restLabels];
      }),
    };
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

  static fromColumnValueAndMap(
    column: Value.ColumnLikeValue,
    map: number[]
  ): MappedColumn {
    return new MappedColumn(
      Column.fromGenerator(
        columnValueToValueGeneratorFunction(column),
        column.meta?.bind(column),
        `MappedColumn`
      ),
      map
    );
  }

  async indexToLabelIndex(mappedIndex: number) {
    return getLabelIndex(this.source, this.map[mappedIndex]);
  }
}
