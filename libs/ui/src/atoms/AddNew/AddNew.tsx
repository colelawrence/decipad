import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Add } from '../../icons';
import { cssVar, setCssVar } from '../../primitives';

const gutterGap = 12;
const iconSize = 16;
const buttonPadding = 6;
const buttonWidth = iconSize + buttonPadding * 2;

const wrapperStyles = css({
  display: 'grid',
  gridTemplateColumns: `auto ${buttonWidth}px`,
  gridColumnGap: `${gutterGap}px`,
  marginRight: `-${buttonWidth + gutterGap}px`,
});

const addButtonStyles = css(
  setCssVar('currentTextColor', cssVar('weakTextColor')),
  {
    alignSelf: 'center',

    backgroundColor: cssVar('strongHighlightColor'),
    borderRadius: '8px',
    padding: `${buttonPadding}px`,

    // Visible when parent is hovered.
    visibility: 'hidden',
    '*:hover > &': {
      visibility: 'unset',
    },

    // Icon sizing
    display: 'grid',
    height: `${buttonWidth}px`,
    width: `${buttonWidth}px`,
  }
);

interface AddNewProps {
  readonly onAdd?: () => void;
}

export const AddNew: React.FC<AddNewProps> = ({ children, onAdd = noop }) => (
  <div css={wrapperStyles}>
    {children}
    <button css={addButtonStyles} onClick={onAdd}>
      <Add />
    </button>
  </div>
);
