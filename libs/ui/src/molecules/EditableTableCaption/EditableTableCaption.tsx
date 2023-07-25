/* eslint-disable decipad/css-prop-named-variable */
import { css } from '@emotion/react';
import { Children, FC, PropsWithChildren, useContext } from 'react';
import { SegmentButtons, TextAndIconButton } from '../../atoms';
import * as icons from '../../icons';
import { FormulasDrawer } from '../../organisms';
import { markTypes } from '../../organisms/PlotParams/PlotParams';
import {
  cssVar,
  display,
  p14Regular,
  placeholderOpacity,
} from '../../primitives';
import { codeBlock, getThemeColor } from '../../styles';
import {
  hideOnPrint,
  slimBlockWidth,
  wideBlockWidth,
} from '../../styles/editor-layout';
import { AvailableSwatchColor, TableStyleContext } from '../../utils';
import { CreateChartMenu } from '../CreateChartMenu/CreateChartMenu';
import { IconPopover } from '../IconPopover/IconPopover';

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
  lineBreak: 'unset',
});

const tableVarStyles = css(codeBlock.structuredVariableStyles, {
  padding: '4px 8px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  overflowWrap: 'anywhere',
  maxWidth: '174px',
  wordBreak: 'break-word',
  whiteSpace: 'normal',
  '@media print': {
    background: 'unset',
  },
});

const tableTitleWrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textAlign: 'center',
});

const tableIconSizeStyles = css({
  display: 'grid',
  width: 16,
  height: 16,
});

const buttonRowStyles = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '6px',
  alignItems: 'center',
});

const placeholderStyles = css(codeBlock.structuredVariableStyles, {
  cursor: 'text',
  display: 'flex',
  '&::before': {
    ...display,
    ...p14Regular,
    pointerEvents: 'none',
    content: 'attr(aria-placeholder)',
    opacity: placeholderOpacity,
  },
  lineHeight: '24px',
  paddingTop: '2px',
});

const wrapperStyle = css({ display: 'flex', textAlign: 'center' });

const editableTableCaptionStyles = css(codeBlock.structuredVariableStyles);

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

  const Icon = icons[icon];
  const [caption, ...tableFormulaEditors] = Children.toArray(children);

  return (
    <div css={isForWideTable ? tableCaptionWideStyles : tableCaptionSlimStyles}>
      <div css={[tableCaptionInnerStyles, tableCaptionSlimStyles]}>
        <div
          css={[
            tableTitleWrapperStyles,
            tableVarStyles,
            {
              backgroundColor: color
                ? getThemeColor(color).Background.Subdued
                : cssVar('themeBackgroundSubdued'),
              mixBlendMode: 'luminosity',
            },
          ]}
        >
          <div
            contentEditable={false}
            css={[
              tableIconSizeStyles,
              {
                mixBlendMode: 'luminosity',
              },
            ]}
          >
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
            css={[
              placeholderStyles,
              editableTableCaptionStyles,
              {
                color: color
                  ? getThemeColor(color).Text.Default
                  : cssVar('themeTextDefault'),
              },
            ]}
            spellCheck={false}
            contentEditable={!readOnly}
            data-testid={'table-name-input'}
          >
            {caption}
          </div>
        </div>
        <div css={css(buttonRowStyles, hideOnPrint)} contentEditable={false}>
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
            <CreateChartMenu
              onAddChartViewButtonPress={onAddChartViewButtonPress}
            />
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
                      onClick: () =>
                        tableFormulaEditors.length !== 0
                          ? setHideFormulas(!hideFormulas)
                          : null,
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

      <div
        css={toggleFormulaStyles(
          !!hideFormulas,
          !!isCollapsed,
          tableFormulaEditors.length
        )}
      >
        <FormulasDrawer readOnly={readOnly}>
          {tableFormulaEditors}
        </FormulasDrawer>
      </div>
    </div>
  );
};
