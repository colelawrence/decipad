import { getResultTypeComponent, ResultTypeProps } from '../../lib/results';

export const CodeResult = ({
  type,
  value,
  variant = 'block',
}: ResultTypeProps): ReturnType<React.FC> => {
  const Result = getResultTypeComponent({ value, variant, type });
  return <Result type={type} value={value} variant={variant} />;
};
