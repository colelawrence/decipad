import { InBlockResult } from '@decipad/language';
import { DateResult, NumberResult, TimeUnitsResult } from '../atoms';
import { RangeResult } from '../organisms';
import { ColumnResult } from './Editor/Blocks/Result/ColumnResult';
import { TableResult } from './Editor/Blocks/Result/TableResult';

type Variant = 'block' | 'inline';

export interface ResultTypeProps {
  readonly value: InBlockResult['value'];
  readonly type: InBlockResult['valueType'];
  readonly variant?: Variant;
}

type ResultTypeComponent = (props: ResultTypeProps) => ReturnType<React.FC>;

interface ResultTypeMatcher {
  component: ResultTypeComponent;
  match: (props: ResultTypeProps) => boolean;
}

export const DefaultResult = ({
  value,
}: ResultTypeProps): ReturnType<React.FC> => <>{String(value ?? '')}</>;
export const FunctionResult = () => <>ƒ</>;

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
      match: ({ type }) => type.columnTypes != null,
    },
    {
      component: ColumnResult,
      match: ({ type, value }) =>
        type.columnSize != null && Array.isArray(value),
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
