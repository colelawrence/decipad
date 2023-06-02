/* eslint decipad/css-prop-named-variable: 0 */
import { N } from '@decipad/number';
import { useComputer } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { FC } from 'react';
import { characterLimitStyles } from '../../styles/results';
import { CodeResultProps } from '../../types';
import { Tooltip } from '../Tooltip/Tooltip';

export const NumberResult: FC<CodeResultProps<'number'>> = ({
  type,
  value,
  tooltip = true,
  variant = 'block',
}) => {
  const computer = useComputer();

  const formatted = computer.formatNumber(type, N(value));
  const preciseString = formatted.asStringPrecise;
  const unitPart = formatted.partsOf.find(
    (part) => part.type === 'unit'
  )?.value;
  const currencyPart = formatted.partsOf.find(
    (part) => part.type === 'currency'
  )?.value;

  const fullResult = <span>{formatted.asString}</span>;
  const trigger = (
    <span
      data-testid={`number-result:${formatted.asString}`}
      data-highlight-changes
      css={
        tooltip && [
          characterLimitStyles,
          variant === 'inline' ? { maxWidth: '120px' } : { maxWidth: '205px' },
        ]
      }
    >
      {fullResult}
    </span>
  );

  if (!tooltip || formatted.asString === preciseString) {
    return trigger;
  }

  return (
    <Tooltip trigger={trigger} stopClickPropagation>
      {unitPart ? (
        <>
          <p>
            {currencyPart}
            {preciseString}
          </p>
          <p css={css({ fontStyle: 'italic' })}>{unitPart}</p>
        </>
      ) : (
        <p>
          {currencyPart}
          {preciseString}
        </p>
      )}
    </Tooltip>
  );
};
