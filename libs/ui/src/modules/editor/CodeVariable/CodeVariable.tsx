/* eslint decipad/css-prop-named-variable: 0 */
import type { SmartRefDecoration, TableCellType } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ReactNode, useMemo } from 'react';
import { CodeVariableTooltip } from '../CodeVariableTooltip/CodeVariableTooltip';
import { List, Loading } from '../../../icons';
import { cssVar } from '../../../primitives';
import { codeBlock, results } from '../../../styles';
import { getTypeIcon } from '../../../utils';

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
  readonly tableName?: string;
  readonly columnName?: string;
  readonly isInitialized?: boolean;
  readonly decoration?: SmartRefDecoration;
  readonly injectErrorChildren?: ReactNode;
  onGoToDefinition?: () => void;
}

export type VariableScope = 'global' | 'local' | 'undefined';

// eslint-disable-next-line complexity
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
  isSelected = false,
  tableName,
  columnName,
  decoration,
  injectErrorChildren,
}: CodeVariableProps): ReturnType<React.FC> => {
  const isColumn = !!(tableName && columnName);
  const isCell = decoration === 'cell';

  const Icon = useMemo(() => type && getTypeIcon(type), [type]);

  const isFormulaHeading = type?.kind === 'table-formula';
  const lazyChildren =
    isInitialized || children ? (
      children
    ) : (
      <span
        css={[results.resultLoadingIconStyles, { verticalAlign: 'middle' }]}
      >
        <Loading />
      </span>
    );

  const decorated = (
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
              isSelected && { userSelect: 'none' },
              isFormulaHeading && { userSelect: 'none' },
            ]
      }
    >
      {isColumn || isCell ? (
        <span css={{ marginLeft: -4, whiteSpace: 'nowrap' }}>
          <span css={isColumn && labelStyles} contentEditable={false}>
            <span css={iconStyles}>{injectErrorChildren || <List />}</span>
            {isColumn && <span css={liveSpanStyles}>{tableName} |</span>}
          </span>
          {lazyChildren}
        </span>
      ) : (
        <>
          {isInitialized && (injectErrorChildren || Icon) && (
            <span css={css(iconStyles)} contentEditable={false}>
              {injectErrorChildren || (Icon && <Icon />)}
            </span>
          )}
          {lazyChildren}
        </>
      )}
    </span>
  );

  if (!showTooltip) {
    return decorated;
  }

  return (
    <CodeVariableTooltip
      variableMissing={variableMissing}
      defBlockId={defBlockId}
      provideDefinitionLink={provideVariableDefLink}
    >
      {decorated}
    </CodeVariableTooltip>
  );
};

const labelStyles = css({
  marginTop: -4,
  paddingTop: 4,
  marginBottom: -8,
  paddingBottom: 8,
  padding: 'auto',
  marginRight: 4,
  paddingRight: 4,
});

const liveSpanStyles = css({
  paddingLeft: 4,
});

const localVarStyles = css({
  color: cssVar('textSubdued'),
});

const iconStyles = css({
  mixBlendMode: 'luminosity',
  display: 'inline-block',
  verticalAlign: 'text-top',
  height: '16px',
  width: '16px',
  marginRight: 4,
});

const typeStyles = css({
  outline: `solid 1px ${cssVar('borderDefault')}`,
  color: cssVar('textDefault'),
  backgroundColor: cssVar('backgroundDefault'),
});

const selectedStyles = css({
  backgroundColor: cssVar('textDefault'),
  color: cssVar('backgroundDefault'),
});
