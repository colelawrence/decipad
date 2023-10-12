import type { Result } from '@decipad/remote-computer';
import { FC } from 'react';
import { css } from '@emotion/react';
import { QuestionMark, Cloud } from '../../icons';
import { CodeError } from '../../atoms';

interface DatabaseConnectionProps {
  result: Result.Result;
}

const firstColumnValue = (
  result: Result.Result<'materialized-table'>,
  columnName: string
): Result.OneResult | undefined => {
  const { type } = result;
  if (type.kind === 'materialized-table') {
    const valueIndex = type.columnNames.indexOf(columnName);
    if (valueIndex >= 0) {
      const value =
        result.value as Result.Result<'materialized-table'>['value'];
      return value[valueIndex]?.[0];
    }
  }
  return undefined;
};

const iconWrapper = css({
  width: '16px',
  height: '16px',
  display: 'flex',
  marginTop: '-18px',
});

export const DatabaseConnection: FC<DatabaseConnectionProps> = ({ result }) => {
  if (result.type.kind === 'materialized-table') {
    const tableResult = result as Result.Result<'materialized-table'>;
    const ok = firstColumnValue(tableResult, 'ok');
    if (ok) {
      return (
        <span css={iconWrapper}>
          <Cloud />
        </span>
      );
    }
    if (ok == null) {
      return (
        <span css={iconWrapper}>
          <QuestionMark />
        </span>
      );
    }
    const error = firstColumnValue(tableResult, 'error');
    if (typeof error === 'string') {
      return (
        <span css={iconWrapper}>
          <CodeError message={error} />
        </span>
      );
    }
  }
  return (
    <span css={iconWrapper}>
      <QuestionMark />
    </span>
  );
};
