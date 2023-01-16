import type { TableCellType } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { noop } from 'lodash';
import { ReactNode, useMemo } from 'react';
import { CodeVariableTooltip } from '..';
import { cssVar } from '../../primitives';
import { codeBlock } from '../../styles';
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
  readonly children: ReactNode;
  readonly onClick?: () => void;
  readonly provideVariableDefLink?: boolean;
  readonly type?: TableCellType;
  readonly variableScope?: VariableScope;
  readonly defBlockId?: string | null;
  readonly showTooltip?: boolean;
  readonly isSelected?: boolean;
  readonly variableMissing?: boolean;
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
  defBlockId,
  onGoToDefinition,
  isSelected = false,
}: CodeVariableProps): ReturnType<React.FC> => {
  const Icon = useMemo(() => type && getTypeIcon(type), [type]);
  const decoration = (
    <span
      onClick={onClick}
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
      {Icon && (
        <span css={iconStyles} contentEditable={false}>
          <Icon />
        </span>
      )}
      {children}
    </span>
  );

  if (!showTooltip) {
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
