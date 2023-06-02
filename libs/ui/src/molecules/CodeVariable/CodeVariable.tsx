/* eslint decipad/css-prop-named-variable: 0 */
import type { TableCellType } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ReactNode, useMemo } from 'react';
import { CodeVariableTooltip } from '..';
import { Loading } from '../../icons';
import { cssVar } from '../../primitives';
import { codeBlock, results } from '../../styles';
import { getTypeIcon } from '../../utils';

const localVarStyles = css({
  color: cssVar('weakTextColor'),
});

const iconStyles = css({
  display: 'inline-block',
  verticalAlign: 'text-top',
  height: '16px',
  width: '16px',
  marginRight: '4px',
});

const typeStyles = css({
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: cssVar('weakerTextColor'),
  color: cssVar('weakTextColor'),
  backgroundColor: cssVar('backgroundColor'),
});

const selectedStyles = css({
  backgroundColor: cssVar('bubbleBackground'),
  color: cssVar('bubbleColor'),
});

interface CodeVariableProps {
  readonly children?: ReactNode;
  readonly onClick?: () => void;
  readonly provideVariableDefLink?: boolean;
  readonly type?: TableCellType;
  readonly variableScope?: VariableScope;
  readonly defBlockId?: string | null;
  readonly showTooltip?: boolean;
  readonly isSelected?: boolean;
  readonly variableMissing?: boolean;
  readonly isInitialized?: boolean;
  onGoToDefinition?: () => void;
}

export type VariableScope = 'global' | 'local' | 'undefined';

export const CodeVariable = ({
  children,
  showTooltip = true,
  provideVariableDefLink = false,
  onClick = noop,
  type,
  variableScope = 'global',
  variableMissing = false,
  isInitialized = true,
  defBlockId,
  onGoToDefinition,
  isSelected = false,
}: CodeVariableProps): ReturnType<React.FC> => {
  const Icon = useMemo(() => type && getTypeIcon(type), [type]);
  const decoration = (
    <span
      onClick={isInitialized ? onClick : noop}
      css={
        variableMissing
          ? null
          : [
              codeBlock.varStyles,
              type && typeStyles,
              variableScope === 'local' && localVarStyles,
              isSelected && selectedStyles,
            ]
      }
    >
      {isInitialized && Icon && (
        <span css={iconStyles} contentEditable={false}>
          <Icon />
        </span>
      )}
      {isInitialized || children ? (
        children
      ) : (
        <span
          css={[results.resultLoadingIconStyles, { verticalAlign: 'middle' }]}
        >
          <Loading />
        </span>
      )}
    </span>
  );

  if (!showTooltip || !isInitialized) {
    return decoration;
  }

  return (
    <CodeVariableTooltip
      variableMissing={variableMissing}
      defBlockId={defBlockId}
      provideDefinitionLink={provideVariableDefLink}
      onGoToDefinition={onGoToDefinition}
    >
      {decoration}
    </CodeVariableTooltip>
  );
};
