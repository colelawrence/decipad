/* eslint-disable decipad/css-prop-named-variable */
import { css } from '@emotion/react';
import { Children, FC, PropsWithChildren, useContext } from 'react';
import * as userIcons from '../../../icons/user-icons';
import {
  IconPopover,
  SegmentButtons,
  TableToolbar,
  TextAndIconButton,
} from '../../../shared';
import { slimBlockWidth, wideBlockWidth } from '../../../styles/editor-layout';
import { AvailableSwatchColor, TableStyleContext } from '../../../utils';
import { CreateChartMenu } from '../CreateChartMenu/CreateChartMenu';
import { FormulasDrawer } from '../FormulasDrawer/FormulasDrawer';
import { markTypes } from '../PlotParams/PlotParams';
import { Formula, Hide, Show, TableRows } from 'libs/ui/src/icons';

const tableCaptionWideStyles = css({
  maxWidth: `${wideBlockWidth}px`,
});

const tableCaptionSlimStyles = css({
  maxWidth: `${slimBlockWidth}px`,
});

const toggleFormulaStyles = (
  hideFormulas: boolean,
  isCollapsed: boolean,
  tableFormulasEditorsLength: number
) => ({
  display:
    hideFormulas || isCollapsed || tableFormulasEditorsLength === 0
      ? 'none'
      : 'block',
});

type EditableTableCaptionProps = PropsWithChildren<{
  onAddDataViewButtonPress: () => void;
  onAddChartViewButtonPress?: (type: typeof markTypes[number]) => void;
  isForWideTable?: boolean;
  empty?: boolean;
  readOnly?: boolean;
  formulaEditor?: boolean;
  showToggleCollapsedButton?: boolean;
}>;

export const shouldShowFormulaDrawer = (
  formulaEditor: any,
  isCollapsed: boolean,
  tableFormulaEditors: any[]
): boolean => !!formulaEditor && !isCollapsed && tableFormulaEditors.length > 0;

export const EditableTableCaption: FC<EditableTableCaptionProps> = ({
  empty,
  isForWideTable = false,
  readOnly = false,
  onAddDataViewButtonPress,
  onAddChartViewButtonPress,
  children,
  showToggleCollapsedButton = false,
}) => {
  const {
    color,
    icon,
    isCollapsed,
    hideFormulas = true,
    setIcon,
    setColor,
    setCollapsed,
    setHideFormulas,
    hideAddDataViewButton,
  } = useContext(TableStyleContext);

  const Icon = userIcons[icon];
  const [caption, ...tableFormulaEditors] = Children.toArray(children);

  const actions = (
    <>
      {hideAddDataViewButton || readOnly ? null : (
        <TextAndIconButton
          text="Pivot view"
          iconPosition="left"
          onClick={() => onAddDataViewButtonPress()}
        >
          <TableRows />
        </TextAndIconButton>
      )}
      {hideAddDataViewButton ||
      readOnly ||
      !onAddChartViewButtonPress ? null : (
        <CreateChartMenu
          onAddChartViewButtonPress={onAddChartViewButtonPress}
        />
      )}
      <>
        {showToggleCollapsedButton &&
          setCollapsed &&
          !hideAddDataViewButton &&
          setHideFormulas && (
            <SegmentButtons
              border
              variant="default"
              iconSize="integrations"
              padding="skinny"
              buttons={[
                {
                  children: <Formula />,
                  tooltip: `${hideFormulas ? 'Show' : 'Hide'} formulas`,
                  onClick: () =>
                    tableFormulaEditors.length !== 0
                      ? setHideFormulas(!hideFormulas)
                      : null,
                  testId: 'formula',
                },
                {
                  children: isCollapsed ? <Show /> : <Hide />,
                  tooltip: `${isCollapsed ? 'Show' : 'Hide'} table`,
                  onClick: () => setCollapsed(!isCollapsed),
                  testId: 'table',
                },
              ]}
            />
          )}
      </>
    </>
  );

  return (
    <>
      <TableToolbar
        actions={actions}
        isForWideTable={isForWideTable}
        readOnly={readOnly}
        icon={icon}
        color={color}
        caption={caption}
        empty={empty}
        emptyLabel={'Table name...'}
        iconPopover={
          <IconPopover
            color={color as AvailableSwatchColor}
            trigger={
              <button>
                <Icon />
              </button>
            }
            onChangeIcon={setIcon}
            onChangeColor={setColor}
          />
        }
      />

      <div
        css={isForWideTable ? tableCaptionWideStyles : tableCaptionSlimStyles}
      >
        <div
          css={toggleFormulaStyles(
            !!hideFormulas,
            !!isCollapsed,
            tableFormulaEditors.length
          )}
        >
          {tableFormulaEditors.length > 0 && (
            <FormulasDrawer readOnly={readOnly}>
              {tableFormulaEditors}
            </FormulasDrawer>
          )}
        </div>
      </div>
    </>
  );
};
