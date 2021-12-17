import { SerializedTypeKind } from '@decipad/language';
import { getResultComponent, ResultProps } from '../../lib/results';

export const CodeResult = ({
  parentType,
  type,
  value,
  variant = 'block',
}: ResultProps<SerializedTypeKind>): ReturnType<React.FC> => {
  const Result = getResultComponent({ value, variant, type });
  return (
    <Result
      parentType={parentType}
      type={type}
      value={value}
      variant={variant}
    />
  );
};
