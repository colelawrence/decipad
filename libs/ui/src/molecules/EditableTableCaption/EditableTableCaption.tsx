/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { Children, FC, PropsWithChildren, useContext } from 'react';
import { MenuItem, SegmentButtons, TextAndIconButton } from '../../atoms';

import * as icons from '../../icons';
import { FormulasDrawer } from '../../organisms';
import {
  markTypeIcons,
  markTypeNames,
  markTypes,
  shapes,
} from '../../organisms/PlotParams/PlotParams';
import {
  cssVar,
  display,
  p16Medium,
  placeholderOpacity,
  setCssVar,
} from '../../primitives';
import {
  hideOnPrint,
  slimBlockWidth,
  wideBlockWidth,
} from '../../styles/editor-layout';
import { AvailableSwatchColor, TableStyleContext } from '../../utils';
import { IconPopover } from '../IconPopover/IconPopover';
import { MenuList } from '../MenuList/MenuList';

const tableCaptionWideStyles = css({
  maxWidth: `${wideBlockWidth}px`,
});

const tableCaptionSlimStyles = css({
  maxWidth: `${slimBlockWidth}px`,
});

const tableCaptionInnerStyles = css({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '9px',
  marginBottom: '8px',
  lineBreak: 'unset',
});

const tableTitleWrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const tableIconSizeStyles = css({
  display: 'grid',
  width: '24px',
  height: '24px',
});

const buttonRowStyles = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '4px',
  alignItems: 'center',
});

const placeholderStyles = css(p16Medium, {
  cursor: 'text',
  display: 'flex',
  '&::before': {
    ...display,
    ...p16Medium,
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
    pointerEvents: 'none',
    content: 'attr(aria-placeholder)',
    opacity: placeholderOpacity,
  },
});

const wrapperStyle = css({ display: 'flex' });

const editableTableCaptionStyles = css(p16Medium);
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
  formulaEditor = true,
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
    hideFormulas,
    setIcon,
    setColor,
    setCollapsed,
    setHideFormulas,
    hideAddDataViewButton,
  } = useContext(TableStyleContext);

  const Icon = icons[icon];
  const [caption, ...tableFormulaEditors] = Children.toArray(children);
  return (
    <div css={isForWideTable ? tableCaptionWideStyles : tableCaptionSlimStyles}>
      <div css={[tableCaptionInnerStyles, tableCaptionSlimStyles]}>
        <div css={tableTitleWrapperStyles}>
          <div contentEditable={false} css={tableIconSizeStyles}>
            {readOnly ? (
              <Icon />
            ) : (
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
            )}
          </div>
          <div
            aria-placeholder={empty ? 'Name your table' : ''}
            aria-roledescription="table name"
            css={[editableTableCaptionStyles, placeholderStyles]}
            spellCheck={false}
            contentEditable={!readOnly}
            data-testid={'table-name-input'}
          >
            {caption}
          </div>
        </div>
        <div css={buttonRowStyles} contentEditable={false}>
          {hideAddDataViewButton || readOnly ? null : (
            <TextAndIconButton
              text="Pivot view"
              iconPosition="left"
              onClick={() => onAddDataViewButtonPress()}
            >
              <icons.TableRows />
            </TextAndIconButton>
          )}
          {hideAddDataViewButton ||
          readOnly ||
          !onAddChartViewButtonPress ? null : (
            <MenuList
              root
              dropdown
              trigger={
                <button
                  data-testid={'create-chart-from-table-button'}
                  css={css([hideOnPrint])}
                >
                  <TextAndIconButton text="Chart" iconPosition="left">
                    <icons.Plot />
                  </TextAndIconButton>
                </button>
              }
            >
              {markTypes.map((mark) => {
                const type = shapes.includes(mark) ? 'point' : mark;

                return (
                  <MenuItem
                    key={type}
                    onSelect={() => {
                      onAddChartViewButtonPress(mark);
                    }}
                    icon={markTypeIcons[mark]}
                  >
                    <div
                      css={{ minWidth: '160px' }}
                      data-test-id={`create-chart__${mark}`}
                    >
                      {markTypeNames[mark]}
                    </div>
                  </MenuItem>
                );
              })}
            </MenuList>
          )}
          <div css={wrapperStyle}>
            {showToggleCollapsedButton &&
              setCollapsed &&
              !hideAddDataViewButton &&
              setHideFormulas && (
                <SegmentButtons
                  buttons={[
                    {
                      children: <icons.Formula />,
                      tooltip: `${hideFormulas ? 'Show' : 'Hide'} formulas`,
                      onClick: () => setHideFormulas(!hideFormulas),
                      disabled: isCollapsed,
                      testId: 'formula',
                    },
                    {
                      children: isCollapsed ? <icons.Show /> : <icons.Hide />,
                      tooltip: `${isCollapsed ? 'Show' : 'Hide'} table`,
                      onClick: () => setCollapsed(!isCollapsed),
                      testId: 'table',
                    },
                  ]}
                />
              )}
          </div>
        </div>
      </div>

      {shouldShowFormulaDrawer(
        formulaEditor,
        !!isCollapsed,
        tableFormulaEditors
      ) && (
        <div css={hideFormulas ? { display: 'none' } : { display: 'block' }}>
          <FormulasDrawer readOnly={readOnly}>
            {tableFormulaEditors}
          </FormulasDrawer>
        </div>
      )}
    </div>
  );
};
