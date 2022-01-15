import { SerializedTypeKind } from '@decipad/language';
import { getResultComponent, ResultProps } from '../../lib/results';

export const CodeResult = ({
  parentType,
  type,
  value,
  variant = 'block',
}: ResultProps<SerializedTypeKind>): ReturnType<React.FC> => {
  const Result = getResultComponent({ value, variant, type });

  // Does not present result when result is not present, except for type errors.
  if (value == null && type.kind !== 'type-error') {
    return null;
  }

  return (
    <Result
      parentType={parentType}
      type={type}
      value={value}
      variant={variant}
    />
  );
};
