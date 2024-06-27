/* eslint decipad/css-prop-named-variable: 0 */
import { UserIconKey } from '@decipad/editor-types';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import type { AutocompleteName } from '@decipad/language-interfaces';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Invisible, SegmentButtons, Spinner } from 'libs/ui/src/shared';
import { slimBlockWidth } from 'libs/ui/src/styles/editor-layout';
import { Children, FC, ReactNode } from 'react';
import { Move, Transpose } from '../../../icons';
import * as userIcons from '../../../icons/user-icons';
import { p14Regular, smallScreenQuery } from '../../../primitives';
import { IconPopover, TableToolbar } from '../../../shared/molecules';
import { editorLayout, scrollbars } from '../../../styles';
import { AvailableSwatchColor, TableStyleContext } from '../../../utils';
import { tableCaptionWrapperStyles } from '../EditorTable/EditorTable';
import { VariableNameSelector } from '../VariableNameSelector/VariableNameSelector';

const dataViewWrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
});

const gutterWidth = '60px';

const dataViewTableStyles = css(p14Regular, {
  tableLayout: 'auto',
  'th, td': {
    padding: '8px',
  },
});

const dataViewAlternateRotationTableStyles = css({
  'th, td': {
    paddingTop: '2px',
    paddingBottom: '2px',
  },
  'td[data-empty]': {
    padding: 0,
  },
});

const dataViewTableWrapperStyles = css(
  {
    transform: `translateX(calc((((100vw - ${slimBlockWidth}px) / 2)) * -1 ))`,
    width: '100vw',
    minWidth: editorLayout.slimBlockWidth,
    paddingBottom: '12px',
    position: 'relative',
    whiteSpace: 'nowrap',
    display: 'flex',
    [smallScreenQuery]: {
      maxWidth: `calc(100vw - ${gutterWidth})`,
      minWidth: '0',
      transform: `translateX(0)`,
    },
  },
  scrollbars.deciInsideNotebookOverflowXStyles
);

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
  readonly empty?: boolean;
  readonly onChangeVariableName?: (varName: string) => void;
  readonly onChangeIcon?: (newIcon: UserIconKey) => void;
  readonly onChangeColor?: (newColor: AvailableSwatchColor) => void;
  readonly rotate: boolean;
  readonly onRotated: (rotated: boolean) => void;
  readonly alternateRotation: boolean;
  readonly onChangeAlternateRotation: (alternateRotation: boolean) => void;
  children: ReactNode;
  data: ReactNode;
}

export const DataView: FC<DataViewProps> = ({
  availableVariableNames,
  variableName,
  icon,
  color,
  empty,

  onChangeVariableName = noop,
  onChangeIcon = noop,
  onChangeColor = noop,
  data,
  children,
  rotate,
  onRotated,
  alternateRotation,
  onChangeAlternateRotation,
}): ReturnType<FC> => {
  const [caption, thead, addNewColumnComponent] = Children.toArray(children);
  const readOnly = useIsEditorReadOnly();
  const Icon = userIcons[icon];

  return (
    <TableStyleContext.Provider
      value={{
        icon,
        color: color as AvailableSwatchColor,
        setIcon: onChangeIcon,
        setColor: onChangeColor,
      }}
    >
      <div
        className={'block-table'}
        css={[dataViewWrapperStyles, tableCaptionWrapperStyles]}
        aria-roledescription="data view"
      >
        <TableToolbar
          isForWideTable={false}
          readOnly={readOnly}
          emptyLabel="Data view name..."
          empty={empty}
          actions={
            <>
              {!readOnly && (
                <VariableNameSelector
                  label=""
                  variableNames={availableVariableNames}
                  selectedVariableName={variableName}
                  onChangeVariableName={onChangeVariableName}
                  testId="data-view-source"
                />
              )}
              {!readOnly && (
                <SegmentButtons
                  border
                  variant="default"
                  iconSize="integrations"
                  padding="skinny"
                  buttons={[
                    {
                      experimentalTooltip: true,
                      tooltip: 'Flip',
                      children: <Transpose />,
                      onClick: () => onRotated(!rotate),
                      testId: 'formula',
                    },
                    {
                      experimentalTooltip: true,
                      children: <Move />,
                      tooltip: `Drilldown`,
                      onClick: () =>
                        onChangeAlternateRotation(!alternateRotation),
                      testId: 'table',
                    },
                  ]}
                />
              )}
            </>
          }
          iconPopover={
            <IconPopover
              color={color as AvailableSwatchColor}
              trigger={
                <button>
                  <Icon />
                </button>
              }
              onChangeIcon={onChangeIcon}
              onChangeColor={onChangeColor}
            />
          }
          icon={icon}
          color={color}
          caption={caption}
        />

        <div css={dataViewTableWrapperStyles} contentEditable={false}>
          <div css={dataViewTableOverflowStyles} contentEditable={false} />
          <div css={tableScroll}>
            {data ? (
              <table
                css={[
                  dataViewTableStyles,
                  alternateRotation && dataViewAlternateRotationTableStyles,
                ]}
                contentEditable={false}
              >
                <thead>
                  {rotate && !alternateRotation ? (
                    <Invisible>{thead}</Invisible>
                  ) : (
                    thead
                  )}
                </thead>
                <tbody aria-roledescription="data view data">{data}</tbody>
              </table>
            ) : variableName ? (
              <Spinner />
            ) : null}
            {variableName && addNewColumnComponent}
          </div>
        </div>
      </div>
    </TableStyleContext.Provider>
  );
};
