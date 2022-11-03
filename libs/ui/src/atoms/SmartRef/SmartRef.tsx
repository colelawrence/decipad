import { css } from '@emotion/react';
import { FC } from 'react';
import { CodeVariable } from '../../molecules';
import { cssVar } from '../../primitives';
import { CodeError } from '../CodeError/CodeError';

type SmartRefProps = {
  readonly symbolName?: string;
  readonly defBlockId?: string;
  readonly errorMessage?: string;
  readonly isSelected?: boolean;
  readonly hasPreviousContent?: boolean;
  readonly hasNextContent?: boolean;
};

const smartRefWrapperStyles = (hasPrevious: boolean, hasNext: boolean) =>
  css({
    ...(hasPrevious
      ? {
          marginLeft: '3px',
        }
      : {}),
    ...(hasNext
      ? {
          marginRight: '3px',
        }
      : {}),
    display: 'inline-flex',
    cursor: 'pointer',
    color: cssVar('variableHighlightTextColor'),
  });

export const SmartRef: FC<SmartRefProps> = ({
  symbolName,
  defBlockId,
  errorMessage,
  isSelected,
  hasPreviousContent,
  hasNextContent,
}: SmartRefProps) => {
  return (
    <span
      css={smartRefWrapperStyles(!!hasPreviousContent, !!hasNextContent)}
      contentEditable={false}
    >
      {symbolName && (
        <CodeVariable
          defBlockId={defBlockId}
          isSelected={isSelected}
          provideVariableDefLink
        >
          {symbolName}
        </CodeVariable>
      )}
      {errorMessage && <CodeError message={errorMessage} url="/docs" />}
    </span>
  );
};
