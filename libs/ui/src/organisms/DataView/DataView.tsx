import { Children, FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { noop } from '@decipad/utils';
import {
  AvailableSwatchColor,
  TableStyleContext,
  UserIconKey,
} from '../../utils';
import { VariableNameSelector } from '../../molecules';
import { p14Regular, smallestDesktop } from '../../primitives';
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
  const [caption, thead, addNewColumnComponent] = Children.toArray(children);
  return (
    <div>
      <TableStyleContext.Provider
        value={{
          icon,
          color,
          setIcon: onChangeIcon,
          setColor: onChangeColor,
          hideAddDataViewButton: true,
        }}
      >
        <div css={tableCaptionWrapperStyles}>{caption}</div>
        <VariableNameSelector
          label="Table"
          variableNames={availableVariableNames}
          selectedVariableName={variableName}
          onChangeVariableName={onChangeVariableName}
        />
        <div css={dataViewTableWrapperStyles} contentEditable={false}>
          <div css={dataViewTableOverflowStyles} contentEditable={false} />

          <table css={dataViewTableStyles}>
            <thead>{thead}</thead>
            <tbody>{data}</tbody>
          </table>
          {addNewColumnComponent}
        </div>
      </TableStyleContext.Provider>
    </div>
  );
};
