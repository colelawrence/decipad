import { InBlockResult } from '@decipad/language';
import { DateResult, NumberResult, TimeUnitsResult } from '../atoms';
import {
  ColumnResult,
  InlineColumnResult,
  RangeResult,
  TableResult,
} from '../organisms';

type Variant = 'block' | 'inline';

export interface ResultTypeProps {
  readonly parentType?: InBlockResult['valueType'];
  readonly type: InBlockResult['valueType'];
  readonly value: InBlockResult['value'];
  readonly variant?: Variant;
}

type ResultTypeComponent = (props: ResultTypeProps) => ReturnType<React.FC>;

interface ResultTypeMatcher {
  component: ResultTypeComponent;
  match: (props: ResultTypeProps) => boolean;
}

export const DefaultResult = ({
  value,
}: ResultTypeProps): ReturnType<React.FC> => <span>{String(value ?? '')}</span>;
export const FunctionResult = () => <span>ƒ</span>;
export const InlineTableResult = () => <span>Table</span>;

export function getResultTypeComponent(
  props: ResultTypeProps
): ResultTypeComponent {
  // Result types are declared here to avoid dependency cycles of result components also importing
  // this file.
  const resultTypes: ResultTypeMatcher[] = [
    {
      component: NumberResult,
      match: ({ type }) => type.type === 'number',
    },
    {
      component: DateResult,
      match: ({ type }) => !!type.date,
    },
    {
      component: TableResult,
      match: ({ type, variant }) =>
        type.columnTypes != null && variant === 'block',
    },
    {
      component: InlineTableResult,
      match: ({ type, variant }) =>
        type.columnTypes != null && variant === 'inline',
    },
    {
      component: ColumnResult,
      match: ({ type, value, variant }) =>
        type.columnSize != null && Array.isArray(value) && variant === 'block',
    },
    {
      component: InlineColumnResult,
      match: ({ type, value, variant }) =>
        type.columnSize != null && Array.isArray(value) && variant === 'inline',
    },
    {
      component: FunctionResult,
      match: ({ type }) => type.functionness,
    },
    {
      component: TimeUnitsResult,
      match: ({ type }) => !!type.timeUnits,
    },
    {
      component: RangeResult,
      match: ({ type }) => !!type.rangeOf,
    },
    {
      component: DefaultResult,
      match: () => true,
    },
  ];

  // The last element in `resultTypes` is always a match.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return resultTypes.find(({ match }) => {
    const trueish = match(props);
    return trueish;
  })!.component;
}
