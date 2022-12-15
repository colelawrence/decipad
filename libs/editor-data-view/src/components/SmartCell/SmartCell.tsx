import { FC, useEffect, useMemo, useState } from 'react';
import { SmartCell as UISmartCell } from '@decipad/ui';
import { useComputer } from '@decipad/react-contexts';
import { Result } from '@decipad/computer';
import { EMPTY } from 'rxjs';
import { css } from '@emotion/react';
import { textify } from '@decipad/parse';
import { SmartProps } from '../DataViewDataLayout';
import { maybeAggregate } from '../../utils/maybeAggregate';

const emptyCellStyles = css({
  borderBottom: 0,
});

export const SmartCell: FC<SmartProps> = ({
  column,
  tableName,
  aggregationType,
  rowSpan,
  colSpan,
  onHover,
  hover,
  alignRight,
  subProperties,
  global = false,
}: SmartProps) => {
  const computer = useComputer();
  const [result, setResult] = useState<Result.Result | null>(null);

  const expressionFilter = useMemo(() => {
    return (
      (column &&
        subProperties.reduce((previous, current) => {
          const escapedValue = textify({
            type: current.type,
            value: current.value as Result.Result['value'],
          });
          return previous === ``
            ? `filter(${tableName}, ${tableName}.${current.name} == ${escapedValue})`
            : `filter(${previous}, ${previous}.${current.name} == ${escapedValue})`;
        }, '')) ||
      tableName
    );
  }, [column, subProperties, tableName]);

  const expression = useMemo(() => {
    return (
      column &&
      expressionFilter &&
      maybeAggregate(
        `${expressionFilter}.${column.name}`,
        column.type.kind,
        aggregationType
      )
    );
  }, [aggregationType, column, expressionFilter]);

  useEffect(() => {
    const sub = (
      (typeof expression === 'string' &&
        expression &&
        computer.expressionResultFromText$(expression)) ||
      EMPTY
    ).subscribe((r) => {
      setResult(r);
    });
    return () => sub.unsubscribe();
  }, [computer, expression]);

  return result === null || aggregationType === undefined ? (
    <td css={emptyCellStyles} />
  ) : (
    <UISmartCell
      aggregationType={aggregationType}
      result={result}
      rowSpan={rowSpan}
      colSpan={colSpan}
      onHover={onHover}
      hover={hover}
      alignRight={alignRight}
      global={global}
    ></UISmartCell>
  );
};
