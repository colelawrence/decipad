import { isFlagEnabled } from '@decipad/feature-flags';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { Children, FC, PropsWithChildren, useContext } from 'react';
import * as icons from '../../icons';
import { FormulasDrawer, TableButton } from '../../organisms';
import {
  cssVar,
  display,
  p16Bold,
  placeholderOpacity,
  setCssVar,
} from '../../primitives';
import { slimBlockWidth, wideBlockWidth } from '../../styles/editor-layout';
import { AvailableSwatchColor, TableStyleContext } from '../../utils';
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

const tableTitleWrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const tableIconSizeStyles = css({
  display: 'grid',
  width: '16px',
  height: '16px',
});

const placeholderStyles = css(p16Bold, {
  cursor: 'text',
  display: 'flex',
  '&::before': {
    ...display,
    ...p16Bold,
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
    pointerEvents: 'none',
    content: 'attr(aria-placeholder)',
    opacity: placeholderOpacity,
  },
});

const editableTableCaptionStyles = css(p16Bold);
type EditableTableCaptionProps = PropsWithChildren<{
  onAddDataViewButtonPress: (e: any) => void;
  isForWideTable?: boolean;
  empty?: boolean;
  readOnly?: boolean;
  formulaEditor?: boolean;
  showToggleCollapsedButton?: boolean;
}>;

export const EditableTableCaption: FC<EditableTableCaptionProps> = ({
  empty,
  formulaEditor = true,
  isForWideTable = false,
  readOnly = false,
  onAddDataViewButtonPress,
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
            {useIsEditorReadOnly() ? (
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
          >
            {caption}
          </div>
        </div>
        <div css={css({ display: 'inline-flex' })}>
          {showToggleCollapsedButton && setCollapsed ? (
            <TableButton
              setState={setCollapsed}
              isInState={isCollapsed}
              captions={['Show table', 'Hide table']}
              isExpandButton
            />
          ) : null}
          {!hideAddDataViewButton && setHideFormulas ? (
            <TableButton
              setState={setHideFormulas}
              isInState={hideFormulas}
              captions={['Show formulas', 'Hide formulas']}
              isExpandButton
            />
          ) : null}
          {hideAddDataViewButton ||
          !isFlagEnabled('DATA_VIEW') ||
          readOnly ? null : (
            <TableButton
              setState={onAddDataViewButtonPress}
              captions={['Create view']}
            />
          )}
        </div>
      </div>

      {formulaEditor &&
        !isCollapsed &&
        tableFormulaEditors.length > 0 &&
        !hideFormulas && <FormulasDrawer>{tableFormulaEditors}</FormulasDrawer>}
    </div>
  );
};
