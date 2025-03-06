import type { TimeSeriesHeaderRowElement } from '@decipad/editor-types';
import type { DataGroup } from 'libs/editor-components/src/DataView/types';
import { Column } from 'libs/ui/src/modules/editor/DataViewColumnMenu/common';
import { useMemo } from 'react';

const CATEGORICAL_COLUMN_TYPES = ['string', 'boolean'];
const NUMERICAL_COLUMN_TYPES = ['number'];

export function useTimeSeriesData({
  theadElement,
  groups,
  availableColumns,
  tableName,
}: {
  theadElement: TimeSeriesHeaderRowElement;
  groups?: DataGroup[];
  availableColumns?: Column[];
  tableName?: string;
}) {
  return useMemo(() => {
    const categoricalColumns = theadElement.children.slice(0, 2);
    const numericalColumns = theadElement.children.slice(2);

    const hasDateSelected =
      theadElement.children.findIndex((x) => x?.cellType?.kind === 'date') !==
      -1;

    const hasNumericalColumnsSelected =
      theadElement.children.findIndex((x) =>
        NUMERICAL_COLUMN_TYPES.includes(x?.cellType?.kind)
      ) !== -1;

    const hasCategoricalColumnsSelected =
      theadElement.children.findIndex((x) =>
        CATEGORICAL_COLUMN_TYPES.includes(x?.cellType?.kind)
      ) !== -1;

    const categoricalColumnsLabels = categoricalColumns.map((x) => x.label);
    const numericalColumnsLabels = numericalColumns.map((x) => x.label);

    const firstCategorical = groups?.flatMap((group) =>
      group?.children
        .filter((x) => x.elementType === 'group')
        .map((x) => String(x.value))
    );
    const uniqueFirstCategorical = [...new Set(firstCategorical)];

    const availableNumericColumns = availableColumns
      ?.filter(
        (x) =>
          NUMERICAL_COLUMN_TYPES.includes(x.type.kind) ||
          CATEGORICAL_COLUMN_TYPES.includes(x.type.kind)
      )
      .filter((x) => !numericalColumnsLabels.includes(x.name) && !!x.blockId);

    const availableCategoricalColumns = availableColumns?.filter(
      (x) =>
        (categoricalColumnsLabels.length
          ? CATEGORICAL_COLUMN_TYPES
          : ['date']
        ).includes(x.type.kind) &&
        !!x.blockId &&
        !categoricalColumnsLabels.includes(x.name)
    );

    const hasSourceTable = !!tableName;

    const showAddColumn =
      hasSourceTable &&
      !!availableCategoricalColumns?.length &&
      categoricalColumns?.length < 2;

    const showAddRow =
      categoricalColumns.length > 1 && // It should have a date and a categorical column selected.
      !!availableNumericColumns?.length; // Must have at least one numeric column.

    const showTable = categoricalColumns.length + numericalColumns.length > 0;

    const hasDateColumn =
      !!availableColumns?.find((x) => x.type.kind === 'date') ||
      hasDateSelected;

    const hasCategoricalColumn =
      availableColumns?.find((x) =>
        CATEGORICAL_COLUMN_TYPES.includes(x.type.kind)
      ) || hasCategoricalColumnsSelected;

    const hasNumericalColumn =
      availableColumns?.find((x) =>
        NUMERICAL_COLUMN_TYPES.includes(x.type.kind)
      ) || hasNumericalColumnsSelected;

    return {
      availableCategoricalColumns,
      availableNumericColumns,
      categoricalColumns,
      hasCategoricalColumn,
      hasDateColumn,
      hasNumericalColumn,
      hasSourceTable,
      numericalColumns,
      showAddColumn,
      showAddRow,
      showTable,
      uniqueFirstCategorical,
    };
  }, [theadElement, groups, availableColumns, tableName]);
}
