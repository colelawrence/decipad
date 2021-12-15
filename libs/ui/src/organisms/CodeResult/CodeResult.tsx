import { getResultTypeComponent, ResultTypeProps } from '../../lib/results';

export const CodeResult = ({
  parentType,
  type,
  value,
  variant = 'block',
}: ResultTypeProps): ReturnType<React.FC> => {
  const Result = getResultTypeComponent({ value, variant, type });
  return (
    <Result
      parentType={parentType}
      type={type}
      value={value}
      variant={variant}
    />
  );
};
