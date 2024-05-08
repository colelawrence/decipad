/* eslint-disable decipad/css-prop-named-variable */
import { css } from '@emotion/react';
import {
  Children,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
} from 'react';
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
import { Formula, Hide, Show, Source, Table } from 'libs/ui/src/icons';
import { ClientEventsContext } from '@decipad/client-events';

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
  onAddChartViewButtonPress?: (_type: typeof markTypes[number]) => void;
  isForWideTable?: boolean;
  empty?: boolean;
  readOnly?: boolean;
  formulaEditor?: boolean;
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
}) => {
  const {
    color,
    icon,
    isCollapsed,
    hideFormulas = true,
    hideCellFormulas,
    setIcon,
    setColor,
    setCollapsed,
    setHideFormulas,
    setHideCellFormulas,
  } = useContext(TableStyleContext);

  const Icon = userIcons[icon];
  const [caption, ...tableFormulaEditors] = Children.toArray(children);

  const clientEvent = useContext(ClientEventsContext);

  const onPivotViewButtonPress = useCallback(
    () => onAddDataViewButtonPress(),
    [onAddDataViewButtonPress]
  );

  const actions = (
    <>
      {!readOnly && (
        <TextAndIconButton
          text="Pivot view"
          iconPosition="left"
          onClick={onPivotViewButtonPress}
        >
          <Table />
        </TextAndIconButton>
      )}
      {!readOnly && onAddChartViewButtonPress && (
        <CreateChartMenu
          onAddChartViewButtonPress={onAddChartViewButtonPress}
        />
      )}
      <>
        {setCollapsed && setHideFormulas && setHideCellFormulas && (
          <SegmentButtons
            border
            variant="default"
            iconSize="integrations"
            padding="skinny"
            buttons={[
              {
                children: <Source />,
                tooltip: `${hideCellFormulas ? 'Show' : 'Hide'} cell formulas`,
                onClick: () => setHideCellFormulas(!hideCellFormulas),
                testId: 'cell-formula',
              },
              {
                children: <Formula />,
                tooltip: `${hideFormulas ? 'Show' : 'Hide'} column formulas`,
                onClick: () => {
                  if (tableFormulaEditors.length !== 0) {
                    setHideFormulas(!hideFormulas);
                    clientEvent({
                      segmentEvent: {
                        type: 'action',
                        action: hideFormulas
                          ? 'Show Table Formulas Button Clicked'
                          : 'Hide Table Formulas Button Clicked',
                        props: {
                          analytics_source: 'frontend',
                        },
                      },
                    });
                  }
                },
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
