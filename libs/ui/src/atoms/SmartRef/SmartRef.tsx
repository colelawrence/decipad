import { css } from '@emotion/react';
import { FC } from 'react';
import { CodeVariable } from '../../molecules';
import { cssVar } from '../../primitives';
import { CodeError } from '../CodeError/CodeError';

type SmartRefProps = {
  readonly symbolName?: string;
  readonly defBlockId?: string;
  readonly errorMessage?: string;
};

const smartRefWrapperStyles = css({
  display: 'inline-flex',
  cursor: 'pointer',
  color: cssVar('variableHighlightTextColor'),
});

export const SmartRef: FC<SmartRefProps> = ({
  symbolName,
  defBlockId,
  errorMessage,
}: SmartRefProps) => {
  return (
    <span css={smartRefWrapperStyles} contentEditable={false}>
      {symbolName && (
        <CodeVariable defBlockId={defBlockId}>{symbolName}</CodeVariable>
      )}
      {errorMessage && <CodeError message={errorMessage} url="/docs" />}
    </span>
  );
};
