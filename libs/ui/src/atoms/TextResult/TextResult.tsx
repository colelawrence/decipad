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
  if (!tooltip) {
    return <span>{value}</span>;
  }

  const fullString = <span>{value}</span>;

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

  return <Tooltip trigger={trigger}>{value}</Tooltip>;
}

export default TextResult;
