import { FC, useEffect, useState } from 'react';
import { SmartCell as UISmartCell } from '@decipad/ui';
import { useComputer } from '@decipad/react-contexts';
import { Result } from '@decipad/computer';
import { EMPTY } from 'rxjs';
import { SmartProps } from '../DataViewDataLayout';
import { maybeAggregate } from '../../utils/maybeAggregate';

export const SmartCell: FC<SmartProps> = ({
  column,
  tableName,
  aggregationType,
  rowSpan,
  colSpan,
  onHover,
  hover,
  alignRight,
  subproperties,
}: SmartProps) => {
  const computer = useComputer();
  const [result, setResult] = useState<Result.Result | null>(null);

  const expressionFilter = subproperties
    .slice()
    .reverse()
    .reduce((previous, current) => {
      const escapedValue =
        typeof current.value === 'string'
          ? JSON.stringify(current.value)
          : current.value;
      return previous === ``
        ? `filter(${tableName}, ${tableName}.${current.name} == ${escapedValue})`
        : `filter(${previous}, ${previous}.${current.name} == ${escapedValue})`;
    }, ``);

  const expression = maybeAggregate(
    `${expressionFilter}.${column.name}`,
    column.type.kind,
    aggregationType
  );

  useEffect(() => {
    const sub = (
      (typeof expression === 'string' &&
        computer.expressionResultFromText$(expression)) ||
      EMPTY
    ).subscribe((r) => {
      setResult(r);
    });
    return () => sub.unsubscribe();
  }, [computer, expression]);

  return result === null ? (
    <td />
  ) : (
    <UISmartCell
      aggregationType={aggregationType}
      result={result}
      rowSpan={rowSpan}
      colSpan={colSpan}
      onHover={onHover}
      hover={hover}
      alignRight={alignRight}
    ></UISmartCell>
  );
};
