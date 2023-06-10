/* eslint decipad/css-prop-named-variable: 0 */
import { SmartRefDecoration } from '@decipad/editor-types';
import { isTableIdentifier } from '@decipad/utils';
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
  readonly isInitialized?: boolean;
  readonly hasPreviousContent?: boolean;
  readonly hasNextContent?: boolean;
  readonly decoration?: SmartRefDecoration;
};

export const SmartRef: FC<SmartRefProps> = ({
  symbolName,
  defBlockId,
  errorMessage,
  isSelected,
  isInitialized = false,
  hasPreviousContent,
  hasNextContent,
  decoration,
}: SmartRefProps) => {
  const [tableName, columnName] = isTableIdentifier(symbolName);

  return (
    <span
      css={smartRefWrapperStyles(!!hasPreviousContent, !!hasNextContent)}
      contentEditable={false}
      data-testid="smart-ref"
    >
      <CodeVariable
        defBlockId={defBlockId}
        isSelected={isSelected}
        provideVariableDefLink
        tableName={tableName} // maybe undefined
        columnName={columnName} // maybe undefined
        isInitialized={isInitialized}
        decoration={decoration}
      >
        {columnName || symbolName}
      </CodeVariable>

      {isInitialized && errorMessage && (
        <CodeError message={errorMessage} url="/docs/" />
      )}
    </span>
  );
};

const smartRefWrapperStyles = (hasPrevious: boolean, hasNext: boolean) =>
  css({
    ...(hasPrevious
      ? {
          marginLeft: '1px',
        }
      : {}),
    ...(hasNext
      ? {
          marginRight: '1px',
        }
      : {}),
    cursor: 'pointer',
    color: cssVar('variableHighlightTextColor'),
  });
