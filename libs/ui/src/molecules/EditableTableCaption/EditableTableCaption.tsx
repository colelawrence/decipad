import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { Children, FC, PropsWithChildren, useContext } from 'react';
import * as icons from '../../icons';
import { FormulasDrawer } from '../../organisms';
import { cssVar, display, p16Bold, setCssVar } from '../../primitives';
import { blockAlignment } from '../../styles';
import { TableStyleContext } from '../../utils';
import { IconPopover } from '../IconPopover/IconPopover';

const tableCaptionWideStyles = css({});

const tableCaptionSlimStyles = css({});

const tableTitleWrapper = css({
  alignItems: 'center',
  display: 'flex',
  gap: '9px',
  padding: `${blockAlignment.editorTable.paddingTop} 0 12px 0`,
  lineBreak: 'unset',
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

const editableTableCaptionStyles = css(p16Bold);
type EditableTableCaptionProps = PropsWithChildren<{
  isForWideTable?: boolean;
  empty?: boolean;
  formulaEditor?: boolean;
}>;

export const EditableTableCaption: FC<EditableTableCaptionProps> = ({
  empty,
  formulaEditor = true,
  isForWideTable = false,
  children,
}) => {
  const { color, icon, setIcon, setColor } = useContext(TableStyleContext);
  const Icon = icons[icon];
  const [caption, ...tableFormulaEditors] = Children.toArray(children);
  return (
    <div css={isForWideTable ? tableCaptionWideStyles : tableCaptionSlimStyles}>
      <div css={tableTitleWrapper}>
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
      {formulaEditor && tableFormulaEditors.length > 0 && (
        <FormulasDrawer>{tableFormulaEditors}</FormulasDrawer>
      )}
    </div>
  );
};
