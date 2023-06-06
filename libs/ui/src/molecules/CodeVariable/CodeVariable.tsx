/* eslint decipad/css-prop-named-variable: 0 */
import type { TableCellType } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ReactNode, useMemo } from 'react';
import { CodeVariableTooltip } from '..';
import { List, Loading } from '../../icons';
import { cssVar, setCssVar } from '../../primitives';
import { codeBlock, results } from '../../styles';
import { getTypeIcon } from '../../utils';

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
  tableName,
  columnName,
}: CodeVariableProps): ReturnType<React.FC> => {
  const isColumn = !!(tableName && columnName);

  const Icon = useMemo(() => type && getTypeIcon(type), [type]);

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
              isColumn && columnStyles,
              isSelected && isColumn && isSelectedColumnStyles,
            ]
      }
    >
      {isColumn ? (
        <span css={{ marginLeft: -4, whiteSpace: 'nowrap' }}>
          <span css={labelStyles} contentEditable="false">
            <span css={[liveIconStyles, iconStyles]}>
              <List />
            </span>
            <span css={liveSpanStyles}>{tableName}</span>
          </span>
          {lazyChildren}
        </span>
      ) : (
        <>
          {isInitialized && Icon && (
            <span css={iconStyles} contentEditable={false}>
              <Icon />
            </span>
          )}
          {lazyChildren}
        </>
      )}
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

const labelStyles = css({
  marginTop: -4,
  paddingTop: 4,
  marginBottom: -8,
  paddingBottom: 8,
  borderRight: `1px solid ${cssVar('backgroundColor')}`,
  padding: 'auto',
  marginRight: 4,
  paddingRight: 4,
});

const liveIconStyles = css({
  svg: {
    ...setCssVar('currentTextColor', cssVar('bubbleColumnTextColor')),
    ...setCssVar('strongTextColor', cssVar('bubbleColumnTextColor')),
    ...setCssVar('iconBackgroundColor', cssVar('bubbleColumnColor')),
  },
});

const liveSpanStyles = css({
  paddingLeft: 4,
});

const localVarStyles = css({
  color: cssVar('weakTextColor'),
});

const iconStyles = css({
  display: 'inline-block',
  verticalAlign: 'text-top',
  height: '16px',
  width: '16px',
  marginRight: 4,
});

const typeStyles = css({
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: cssVar('bubbleTableFormulaTextColor'),
  color: cssVar('bubbleTableFormulaTextColor'),
  backgroundColor: cssVar('bubbleTableFormulaColor'),
  svg: {
    ...setCssVar('normalTextColor', cssVar('bubbleTableFormulaTextColor')),
  },
});

const selectedStyles = css({
  backgroundColor: cssVar('bubbleBackground'),
  color: cssVar('bubbleColor'),
});

const columnStyles = css({
  color: cssVar('bubbleColumnTextColor'),
  backgroundColor: cssVar('bubbleColumnColor'),
});

const isSelectedColumnStyles = css({
  color: cssVar('bubbleColumnTextSelectedColor'),
  backgroundColor: cssVar('bubbleColumnSelectedColor'),
});
