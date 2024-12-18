/* eslint decipad/css-prop-named-variable: 0 */
import type { SmartRefDecoration, TableCellType } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ReactNode, useMemo } from 'react';
import { CodeVariableTooltip } from '../CodeVariableTooltip/CodeVariableTooltip';
import { List } from '../../../icons';
import { cssVar } from '../../../primitives';
import { codeBlock, results } from '../../../styles';
import { getTypeIcon } from '../../../utils';
import { Loading } from 'libs/ui/src/shared';
import { TableSmall } from 'libs/ui/src/icons/user-icons';

export interface CodeVariableProps {
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
        <span>
          <span css={isColumn} contentEditable={false}>
            <span css={iconStyles} style={{ opacity: 0.5 }}>
              {injectErrorChildren || (isColumn ? <TableSmall /> : <List />)}
            </span>

            {isColumn && (
              <>
                <span style={{ opacity: 0.7 }}>{tableName}</span>
                <span>.</span>
              </>
            )}
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

const localVarStyles = css({
  color: cssVar('textSubdued'),
});

const iconStyles = css({
  position: 'relative',
  top: -1,
  mixBlendMode: 'luminosity',
  display: 'inline-block',
  verticalAlign: 'baseline',
  height: '16px',
  width: '16px',
  marginRight: '2px',
  svg: { display: 'inline' },
});

const typeStyles = css({
  color: cssVar('textDefault'),
  backgroundColor: `color-mix(in srgb, ${cssVar(
    'themeBackgroundSubdued'
  )} 30%, transparent)`,
  outline: `solid 1px ${cssVar('themeBackgroundSubdued')}`,
  outlineOffset: -1,
});

const selectedStyles = css({
  backgroundColor: cssVar('textDefault'),
  color: cssVar('backgroundDefault'),
});
