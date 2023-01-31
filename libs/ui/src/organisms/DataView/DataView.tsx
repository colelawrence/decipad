import { AutocompleteName } from '@decipad/computer';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Children, FC, ReactNode } from 'react';
import { VariableNameSelector } from '../../molecules';
import { cssVar, p14Regular, smallScreenQuery } from '../../primitives';
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
  transform: `translateX(calc((((100vw - 580px) / 2)) * -1 ))`,
  width: '100vw',
  minWidth: editorLayout.slimBlockWidth,
  overflowX: 'auto',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  paddingBottom: '12px',
  position: 'relative',
  whiteSpace: 'nowrap',
  display: 'flex',
  '&:hover': {
    scrollbarWidth: 'inherit',
    msOverflowStyle: 'inherit',
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: cssVar('highlightColor'),
    },
  },
  '&::-webkit-scrollbar': {
    width: '100px',
    height: '8px',
  },

  '&::-webkit-scrollbar-thumb': {
    width: '3px',
    height: '3px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
  },

  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
    height: '3px',
  },

  '&::-webkit-scrollbar-button': {
    width: `calc((100vw - 580px)/4)`,
  },

  '&::-ms-scrollbar-thumb': {
    width: '3px',
    height: '3px',
    backgroundColor: cssVar('highlightColor'),
    borderRadius: '8px',
  },

  '&::-ms-scrollbar-track': {
    backgroundColor: 'transparent',
    height: '3px',
  },

  '&::-ms-scrollbar-button': {
    width: `calc((100vw - 580px)/4)`,
  },
  [smallScreenQuery]: {
    maxWidth: `calc(100vw - ${gutterWidth})`,
    minWidth: '0',
    transform: `translateX(0)`,
  },
});

const scrollRightOffset = `(((100vw - 1055px) / 2) + 200px)`;

export const tableScroll = css({
  display: 'flex',
  flexDirection: 'row',
  marginLeft: '60px',
  paddingRight: `calc(${scrollRightOffset})`,
  [smallScreenQuery]: {
    paddingRight: '0px',
    marginLeft: '0px',
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
  const readOnly = useIsEditorReadOnly();

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
      <div css={dataViewWrapperStyles} aria-roledescription="data view">
        <div css={dataViewControlsStyles}>
          <div css={tableCaptionWrapperStyles}>{caption}</div>
          {!readOnly && (
            <VariableNameSelector
              label="Source"
              variableNames={availableVariableNames}
              selectedVariableName={variableName}
              onChangeVariableName={onChangeVariableName}
            />
          )}
        </div>
        <div css={dataViewTableWrapperStyles} contentEditable={false}>
          <div css={dataViewTableOverflowStyles} contentEditable={false} />
          <div css={tableScroll}>
            <table css={dataViewTableStyles} contentEditable={false}>
              <thead>{thead}</thead>
              <tbody aria-roledescription="data view data">{data}</tbody>
            </table>
            {variableName && addNewColumnComponent}
          </div>
        </div>
      </div>
    </TableStyleContext.Provider>
  );
};
