import { css } from '@emotion/react';
import { noop } from 'lodash';
import { ReactNode } from 'react';
import type { TableCellType } from '@decipad/editor-types';
import { grey400, grey500 } from '../../primitives';
import { codeBlock } from '../../styles';
import { getTypeIcon } from '../../utils';
import { CodeVariableTooltip } from '..';

const varStyles = css(codeBlock.variableStyles, {
  padding: '4px 6px',
  borderRadius: '6px',
  fontSize: '13px',
});

const localVarStyles = css({
  color: grey500.rgb,
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
  borderColor: grey400.rgb,
  color: grey500.rgb,
});

interface CodeVariableProps {
  readonly children: ReactNode;
  readonly onClick?: () => void;
  readonly provideVariableDefLink?: boolean;
  readonly type?: TableCellType;
  readonly variableScope?: VariableScope;
  readonly defBlockId?: string | null;
  onGoToDefinition?: () => void;
}

export type VariableScope = 'global' | 'local' | 'undefined';

export const CodeVariable = ({
  children,
  provideVariableDefLink = false,
  onClick = noop,
  type,
  variableScope = 'global',
  defBlockId,
  onGoToDefinition,
}: CodeVariableProps): ReturnType<React.FC> => {
  const Icon = getTypeIcon(type || { kind: 'string' });
  const decoration = (
    <span
      onClick={onClick}
      css={
        variableScope !== 'undefined' && [
          varStyles,
          type && typeStyles,
          variableScope === 'local' && localVarStyles,
        ]
      }
    >
      {type ? (
        <span css={iconStyles} contentEditable={false}>
          <Icon />
        </span>
      ) : null}
      {children}
    </span>
  );

  return (
    <CodeVariableTooltip
      variableMissing={variableScope === 'undefined'}
      defBlockId={defBlockId}
      provideDefinitionLink={provideVariableDefLink}
      onGoToDefinition={onGoToDefinition}
    >
      {decoration}
    </CodeVariableTooltip>
  );
};
