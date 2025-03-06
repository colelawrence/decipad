import { SerializedType } from '@decipad/language-interfaces';
import { SerializedStyles } from '@emotion/react';
import React, {
  CSSProperties,
  ComponentProps,
  ReactElement,
  ReactNode,
  SVGProps,
} from 'react';
import { Tooltip } from 'recharts';
import { Props as DefaultLegendContentProps } from 'recharts/types/component/DefaultLegendContent';
import { ChartProps, CustomTickProps } from '../Charts/types';

export type RechartTooltipProps = ComponentProps<typeof Tooltip>;
export type RechartPayloadProps = RechartTooltipProps['payload'];

export type ScatterTooltipProps = {
  readonly labelColumnName?: string;
  readonly payload: any[];
};

export type PieLegendProps = {
  wrapperStyle?: CSSProperties;
} & DefaultLegendContentProps;

export type CustomToolTripProps = RechartTooltipProps &
  (
    | {
        readonly type: 'Scatter';
        readonly customColor?: string;
        readonly labelColumnName?: string;
      }
    | {
        readonly type: 'Pie';
        readonly total?: number;
      }
    | {
        readonly type: 'Line' | 'Area' | 'Default';
      }
  );

export type CustomToolTripPropsWithPayload = CustomToolTripProps & {
  readonly payload: NonNullable<RechartPayloadProps>;
};

export type CustomTooltipWithTotal = CustomToolTripPropsWithPayload & {
  total?: number;
};
export type CustomTooltipWithGrowth = CustomToolTripPropsWithPayload & {
  growth?: GrowthData;
};
export type TooltipAtomProps = {
  readonly iconStyle?: SerializedStyles;
  readonly name: string | number;
  readonly value: number | string;
  readonly context?: React.ReactNode;
};

export type RadiusProps = [number, number, number, number];

export type AxisProps = {
  xColumnType?: SerializedType;
  tickFormatter?: (value: number) => string;
  customTick?: (props: CustomTickProps) => any;
  xAxisOffset?: number;
  yAxisOffset?: number;
  xAxisLabel?: string;
  setXAxisLabel?: (label: string) => void;
  yAxisLabel?: string;
  setYAxisLabel?: (label: string) => void;
  isExporting?: boolean;
  reverseY?: boolean;
} & Pick<ChartProps, 'startFromZero' | 'xColumnName'>;

export interface DataEntry {
  [key: string]: any;
}

export interface GrowthData {
  [key: string]: number | undefined;
}

interface DataEntryWithGrowth extends DataEntry {
  growth: GrowthData;
}

export type DataWithGrowth = DataEntryWithGrowth[];

export type CustomTooltipWithGrowthProps = Partial<CustomToolTripProps> & {
  growth?: GrowthData;
};

export interface calculateTextWithProps {
  readonly fontSize: number;
  readonly text: string;
  readonly defaultResponse?: number;
}

export type RechartContentType =
  | ReactElement
  | ((props: RechartLabelProps) => ReactNode);
export type RechartLabelPosition =
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'inside'
  | 'outside'
  | 'insideLeft'
  | 'insideRight'
  | 'insideTop'
  | 'insideBottom'
  | 'insideTopLeft'
  | 'insideBottomLeft'
  | 'insideTopRight'
  | 'insideBottomRight'
  | 'insideStart'
  | 'insideEnd'
  | 'end'
  | 'center'
  | 'centerTop'
  | 'centerBottom'
  | 'middle'
  | {
      x?: number;
      y?: number;
    };
export interface RechartBaseLabelProps {
  viewBox?: RechartViewBox;
  parentViewBox?: RechartViewBox;
  formatter?: Function;
  value?: number | string;
  offset?: number;
  position?: RechartLabelPosition;
  children?: ReactNode;
  className?: string;
  content?: RechartContentType;
  textBreakAll?: boolean;
  angle?: number;
  index?: number;
}
export interface RechartPolarViewBox {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  clockWise?: boolean;
}
export interface RechartCartesianViewBox {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}
export type RechartViewBox = RechartCartesianViewBox | RechartPolarViewBox;

export type RechartLabelProps = Omit<SVGProps<SVGTextElement>, 'viewBox'> &
  RechartBaseLabelProps;
