import { ResultContent, ResultContentProps } from './Result.component';

export function RangeResult({
  type: { rangeOf },
  value,
}: ResultContentProps): JSX.Element | null {
  if (!rangeOf) {
    return null;
  }

  return (
    <>
      <ResultContent type={rangeOf} value={value[0]} /> &rarr;{' '}
      <ResultContent type={rangeOf} value={value[1]} />
    </>
  );
}
