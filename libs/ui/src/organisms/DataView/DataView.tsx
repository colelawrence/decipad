import { Children, FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { noop } from '@decipad/utils';
import {
  AvailableSwatchColor,
  TableStyleContext,
  UserIconKey,
} from '../../utils';
import { VariableNameSelector } from '../../molecules';
import { cssVar, p14Regular, smallestDesktop } from '../../primitives';
import { editorLayout } from '../../styles';

const halfSlimBlockWidth = `${Math.round(editorLayout.slimBlockWidth / 2)}px`;
const totalWidth = '100vw';
const halfTotalWidth = '50vw';
const wideToSlimBlockWidthDifference = `${
  editorLayout.wideBlockWidth - editorLayout.slimBlockWidth
}px`;
const gutterWidth = '60px';
const leftMargin = `calc(${halfTotalWidth} - ${halfSlimBlockWidth} - ${wideToSlimBlockWidthDifference})`;
const restWidthBlock = `calc(${totalWidth} - ${leftMargin} - ${gutterWidth} - ${gutterWidth})`;

const smallScreenQuery = `@media (max-width: ${smallestDesktop.portrait.width}px)`;

const tableCaptionWrapperStyles = css({
  width: '100%',
  minWidth: editorLayout.slimBlockWidth,
  maxWidth: restWidthBlock,
  overflowX: 'scroll',
  display: 'inline-block',
  [smallScreenQuery]: {
    maxWidth: `calc(100vw - ${gutterWidth})`,
    minWidth: '0',
  },
});

const tableWrapperStyles = css({
  width: 'min-content',
  minWidth: editorLayout.slimBlockWidth,
  maxWidth: restWidthBlock,
  overflowX: 'auto',
  display: 'inline-block',
  [smallScreenQuery]: {
    maxWidth: `calc(100vw - ${gutterWidth})`,
    minWidth: '0',
  },
});

const dataViewTableStyles = css(p14Regular, {
  'th, td': {
    padding: '8px',
    textAlign: 'left',
  },

  tr: {
    borderBottom: `1px solid ${cssVar('strongHighlightColor')}`,
  },
});
interface DataViewProps {
  readonly availableVariableNames: string[];
  readonly variableName: string;
  readonly icon: UserIconKey;
  readonly color: AvailableSwatchColor;
  readonly onChangeVariableName?: (varName: string) => void;
  readonly onChangeIcon?: (newIcon: UserIconKey) => void;
  readonly onChangeColor?: (newColor: AvailableSwatchColor) => void;
  children: ReactNode;
  data: ReactNode;
}

export const DataView: FC<DataViewProps> = ({
  availableVariableNames,
  variableName,
  icon,
  color,
  onChangeVariableName = noop,
  onChangeIcon = noop,
  onChangeColor = noop,
  data,
  children,
}): ReturnType<FC> => {
  const [caption, thead] = Children.toArray(children);
  return (
    <div>
      <TableStyleContext.Provider
        value={{
          icon,
          color,
          setIcon: onChangeIcon,
          setColor: onChangeColor,
        }}
      >
        <div css={tableCaptionWrapperStyles}>{caption}</div>
        <VariableNameSelector
          label="Table"
          variableNames={availableVariableNames}
          selectedVariableName={variableName}
          onChangeVariableName={onChangeVariableName}
        />
        <div contentEditable={false} css={tableWrapperStyles}>
          <table css={dataViewTableStyles}>
            <thead>{thead}</thead>
            <tbody>{data}</tbody>
          </table>
        </div>
      </TableStyleContext.Provider>
    </div>
  );
};
