import { AutocompleteName } from '@decipad/computer';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Children, FC, ReactNode } from 'react';
import { VariableNameSelector } from '../../molecules';
import { p14Regular, smallScreenQuery } from '../../primitives';
import { editorLayout } from '../../styles';
import {
  AvailableSwatchColor,
  TableStyleContext,
  UserIconKey,
} from '../../utils';

const dataViewWrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
});

const dataViewControlsStyles = css({
  display: 'flex',
  flexFlow: 'row wrap',
});

const halfSlimBlockWidth = `${Math.round(editorLayout.slimBlockWidth / 2)}px`;
const totalWidth = '100vw';
const halfTotalWidth = '50vw';
const wideToSlimBlockWidthDifference = `${
  editorLayout.wideBlockWidth - editorLayout.slimBlockWidth
}px`;
const gutterWidth = '60px';
const leftMargin = `calc(${halfTotalWidth} - ${halfSlimBlockWidth} - ${wideToSlimBlockWidthDifference})`;
const restWidthBlock = `calc(${totalWidth} - ${leftMargin} - ${gutterWidth} - ${gutterWidth})`;

const tableCaptionWrapperStyles = css({
  maxWidth: restWidthBlock,
  display: 'inline-block',
  [smallScreenQuery]: {
    maxWidth: `calc(100vw - ${gutterWidth})`,
    minWidth: '0',
  },
});

const dataViewTableStyles = css(p14Regular, {
  tableLayout: 'auto',
  'th, td': {
    padding: '8px',
  },
});

const dataViewTableWrapperStyles = css({
  transform: `translateX(calc((((100vw - 700px) / 2)) * -1 ))`,
  width: '100vw',
  minWidth: editorLayout.slimBlockWidth,
  overflowX: 'auto',
  paddingBottom: '12px',
  position: 'relative',
  whiteSpace: 'nowrap',
  display: 'flex',
  [smallScreenQuery]: {
    maxWidth: `calc(100vw - ${gutterWidth})`,
    minWidth: '0',
    transform: `translateX(0)`,
  },
});

const dataViewTableOverflowStyles = css({
  display: 'inline-block',
  height: '20px',
  minWidth: `calc((100vw - 700px) / 2)`,
});

interface DataViewProps {
  readonly availableVariableNames: AutocompleteName[];
  readonly variableName: string;
  readonly icon: UserIconKey;
  readonly color?: AvailableSwatchColor;
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
  const [caption, thead, addNewColumnComponent] = Children.toArray(children);
  return (
    <TableStyleContext.Provider
      value={{
        icon,
        color: color as AvailableSwatchColor,
        setIcon: onChangeIcon,
        setColor: onChangeColor,
        hideAddDataViewButton: true,
      }}
    >
      <div css={dataViewWrapperStyles}>
        <div css={dataViewControlsStyles}>
          <div css={tableCaptionWrapperStyles}>{caption}</div>
          <VariableNameSelector
            label="Source"
            variableNames={availableVariableNames}
            selectedVariableName={variableName}
            onChangeVariableName={onChangeVariableName}
          />
        </div>
        <div css={dataViewTableWrapperStyles} contentEditable={false}>
          <div css={dataViewTableOverflowStyles} contentEditable={false} />

          <table css={dataViewTableStyles} contentEditable={false}>
            <thead>{thead}</thead>
            <tbody>{data}</tbody>
          </table>
          {variableName && addNewColumnComponent}
        </div>
      </div>
    </TableStyleContext.Provider>
  );
};
