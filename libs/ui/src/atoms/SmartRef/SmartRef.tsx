/* eslint decipad/css-prop-named-variable: 0 */
import { SmartRefDecoration } from '@decipad/editor-types';
import { isTableIdentifier } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { Warning } from '../../icons';
import { CodeVariable } from '../../molecules';
import { cssVar } from '../../primitives';

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
        injectErrorChildren={
          isInitialized && errorMessage && errorMessage !== '' ? (
            <Warning />
          ) : undefined
        }
      >
        {columnName || symbolName}
      </CodeVariable>
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
    color: cssVar('textDefault'),
  });
