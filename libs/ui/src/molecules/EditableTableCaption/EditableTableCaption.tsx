import { isFlagEnabled } from '@decipad/feature-flags';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { Children, FC, PropsWithChildren, useContext } from 'react';
import * as icons from '../../icons';
import { FormulasDrawer } from '../../organisms';
import { cssVar, display, p16Bold, setCssVar } from '../../primitives';
import { blockAlignment } from '../../styles';
import { slimBlockWidth, wideBlockWidth } from '../../styles/editor-layout';
import { TableStyleContext } from '../../utils';
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
  padding: `${blockAlignment.editorTable.paddingTop} 0 12px 0`,
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

  // overlap content (blinking caret) and placeholder
  display: 'grid',
  '> span, ::before': {
    gridArea: '1 / 1',
  },

  '&::before': {
    ...display,
    ...p16Bold,
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
    pointerEvents: 'none',
    content: 'attr(aria-placeholder)',
    opacity: 0.5,
  },
});

const addAViewButtonStyles = css({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  fontWeight: '700',
  '&:hover': {
    opacity: 0.5,
  },
});

const addAViewButtonIconStyles = css({
  width: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
});

const editableTableCaptionStyles = css(p16Bold);
type EditableTableCaptionProps = PropsWithChildren<{
  isForWideTable?: boolean;
  empty?: boolean;
  formulaEditor?: boolean;
  onAddDataViewButtonPress: () => void;
}>;

export const EditableTableCaption: FC<EditableTableCaptionProps> = ({
  empty,
  formulaEditor = true,
  isForWideTable = false,
  onAddDataViewButtonPress,
  children,
}) => {
  const { color, icon, setIcon, setColor, hideAddDataViewButton } =
    useContext(TableStyleContext);
  const Icon = icons[icon];
  const EyeIcon = icons.Eye;
  const [caption, ...tableFormulaEditors] = Children.toArray(children);

  return (
    <div css={isForWideTable ? tableCaptionWideStyles : tableCaptionSlimStyles}>
      <div css={tableCaptionInnerStyles}>
        <div css={tableTitleWrapperStyles}>
          <div contentEditable={false} css={tableIconSizeStyles}>
            {useIsEditorReadOnly() ? (
              <Icon />
            ) : (
              <IconPopover
                color={color}
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
            aria-placeholder={empty ? 'TableName' : ''}
            css={[editableTableCaptionStyles, placeholderStyles]}
          >
            {caption}
          </div>
        </div>
        {hideAddDataViewButton || !isFlagEnabled('DATA_VIEW') ? null : (
          <button
            css={addAViewButtonStyles}
            onMouseDown={onAddDataViewButtonPress}
          >
            <div css={addAViewButtonIconStyles}>
              <EyeIcon />
            </div>
            add a view
          </button>
        )}
      </div>

      {formulaEditor && tableFormulaEditors.length > 0 && (
        <FormulasDrawer>{tableFormulaEditors}</FormulasDrawer>
      )}
    </div>
  );
};
