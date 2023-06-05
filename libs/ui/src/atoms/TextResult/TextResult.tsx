/* eslint decipad/css-prop-named-variable: 0 */
import { characterLimitStyles } from '../../styles/results';
import { Tooltip } from '../Tooltip/Tooltip';

function TextResult({
  value,
  variant,
  tooltip = true,
}: {
  value: string;
  variant: string;
  tooltip: boolean;
}) {
  const serialisedValue = value.toString();
  const fullString = <span>{serialisedValue}</span>;

  if (!tooltip) {
    return fullString;
  }

  const trigger = (
    <span
      data-testid={`text-result:${value}`}
      data-highlight-changes
      css={
        tooltip && [
          characterLimitStyles,
          variant === 'inline' ? { maxWidth: '120px' } : { maxWidth: '205px' },
        ]
      }
    >
      {fullString}
    </span>
  );

  return (
    <Tooltip trigger={trigger}>
      {serialisedValue.length > 300
        ? `${serialisedValue.substring(0, 300)}…`
        : serialisedValue}
    </Tooltip>
  );
}

export default TextResult;
