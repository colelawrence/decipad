import { BasePlotProps } from '@decipad/editor-types';
import { SerializedType } from '@decipad/language-interfaces';

export type PlainObject = {
  readonly table: any[];
};

export interface PlotResultNewProps {
  readonly data?: PlainObject;
}

export type PlotResultProps = {
  typeForColumnName?: (columnName: string) => SerializedType;
  setYAxisLabel?: (label: string) => void;
  setXAxisLabel?: (label: string) => void;
  isExporting?: boolean;
} & PlotResultNewProps &
  Partial<BasePlotProps>;
