import { Tooltip } from '../Tooltip/Tooltip';
import { characterLimitStyles } from '../../styles/results';

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

  const trigger = (
    <span
      css={[
        characterLimitStyles,
        variant === 'inline' ? { maxWidth: '120px' } : { maxWidth: '205px' },
      ]}
    >
      {value}
    </span>
  );

  return <Tooltip trigger={trigger}>{value}</Tooltip>;
}

export default TextResult;
