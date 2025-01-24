/* eslint decipad/css-prop-named-variable: 0 */
import { UserIconKey } from '@decipad/editor-types';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import type { AutocompleteName } from '@decipad/language-interfaces';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Invisible, Loading, SegmentButtons } from '../../../shared';
import { Children, FC, ReactNode } from 'react';
import { Move, Transpose } from '../../../icons';
import * as userIcons from '../../../icons/user-icons';
import { p14Regular } from '../../../primitives';
import { IconPopover, TableToolbar } from '../../../shared/molecules';
import { AvailableSwatchColor, TableStyleContext } from '../../../utils';
import { VariableNameSelector } from '../VariableNameSelector/VariableNameSelector';
import { noTrackScrollbarStyles } from 'libs/ui/src/styles/scrollbars';
import { fullWidthHorizontalScrollable } from 'libs/ui/src/styles/table';

const tableWrapper = css(
  noTrackScrollbarStyles,
  fullWidthHorizontalScrollable,
  {
    gridRow: '4',
    overflowX: 'auto',
    display: 'flex',
    gap: '4px',
  }
);

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

export const loadingIconStyles = css({
  gridRow: '3',
  gridColumn: '1 / span 5',

  minHeight: '19px',
  margin: 'auto',
  display: 'grid',
  '> svg': { height: '16px', display: 'block', margin: '0 auto' },
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
  computing?: boolean;
}

export const DataView: FC<DataViewProps> = ({
  availableVariableNames,
  variableName,
  icon,
  color,
  empty,
  computing,

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
      <TableToolbar
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

      {computing && (
        <div css={loadingIconStyles}>
          <Loading />
        </div>
      )}

      <div css={tableWrapper}>
        {data && (
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
        )}
        {variableName && addNewColumnComponent}
      </div>
    </TableStyleContext.Provider>
  );
};
