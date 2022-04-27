import { css } from '@emotion/react';
import { FC, PropsWithChildren } from 'react';
import { Table as TableIcon } from '../../icons';
import { blockAlignment } from '../../styles';
import { cssVar, display, p16Bold, setCssVar } from '../../primitives';

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
  empty?: boolean;
}>;

export const EditableTableCaption: FC<EditableTableCaptionProps> = ({
  empty,
  children,
}) => {
  return (
    <div css={tableTitleWrapper}>
      <div contentEditable={false} css={tableIconSizeStyles}>
        <TableIcon />
      </div>
      <div
        // eslint-disable-next-line jsx-a11y/aria-props
        aria-role="caption"
        aria-placeholder={empty ? 'TableName' : ''}
        css={[editableTableCaptionStyles, placeholderStyles]}
      >
        {children}
      </div>
    </div>
  );
};
