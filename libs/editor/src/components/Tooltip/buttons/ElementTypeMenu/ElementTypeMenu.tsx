import { Icons } from '@decipad/ui';
import { css } from '@emotion/react';
import {
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
} from '@udecode/plate';
import { FC, MouseEventHandler, useState } from 'react';
import { ToggleElementButton } from './ToggleElementButton/ToggleElementButton';

const wrapperStyles = css({
  position: 'relative',
  height: '100%',
});

const buttonStyles = css({
  backgroundColor: 'transparent',
  border: 'none',
  height: '100%',
  padding: '0 8px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'background-color 0.2s ease-out',
  color: '#111',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  '&:hover': {
    backgroundColor: '#f0f0f2',
  },
  '&:active': {
    color: '#111',
  },
});

const menuStyles = css({
  position: 'absolute',
  left: '-8px',
  top: '50px',
  backgroundColor: 'white',
  width: '162px',
  border: '1px solid #f0f0f2',
  padding: '12px 6px',
  borderRadius: '6px',
  visibility: 'hidden',
});

const menuLabelStyles = css({
  opacity: 0.7,
  fontSize: '13px',
  paddingLeft: '6px',
  paddingBottom: '12px',
  display: 'block',
});

const activeMenuStyles = css({
  visibility: 'visible',
});

const iconStyles = css({
  width: '12px',
  height: '12px',
  display: 'flex',
  alignItems: 'center',
  '> svg > path': {
    stroke: '#111',
    strokeWidth: '1',
  },
});

interface ElementTypeMenuProps {
  currentBlockType: string | null;
}

export const ElementTypeMenu = ({
  currentBlockType,
}: ElementTypeMenuProps): ReturnType<FC> => {
  const [isActive, setIsActive] = useState(false);

  const buttonOnClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setIsActive((prev) => !prev);
  };

  const blockTypeToName = () => {
    switch (currentBlockType) {
      case ELEMENT_H2:
        return 'Subtitle';
      case ELEMENT_H3:
        return 'Subheading';
      case ELEMENT_PARAGRAPH:
        return 'Paragraph';
      case 'lic':
        return 'Unordered List';
      default:
        return 'Font size';
    }
  };

  return (
    <div css={wrapperStyles}>
      <button css={buttonStyles} onMouseDown={buttonOnClick}>
        {blockTypeToName()}{' '}
        <span css={iconStyles}>
          <Icons.Chevron type={isActive ? 'collapse' : 'expand'} />
        </span>
      </button>
      <ul css={[menuStyles, isActive && activeMenuStyles]}>
        <span css={menuLabelStyles}>Turn into</span>
        <ToggleElementButton
          currentBlockType={currentBlockType}
          type={ELEMENT_H2}
          label="Subtitle"
        />
        <ToggleElementButton
          currentBlockType={currentBlockType}
          type={ELEMENT_H3}
          label="Subheading"
        />
        <ToggleElementButton
          currentBlockType={currentBlockType}
          type={ELEMENT_PARAGRAPH}
          label="Paragraph"
        />
        <ToggleElementButton
          currentBlockType={currentBlockType}
          type={ELEMENT_UL}
          label="Unordered list"
        />
      </ul>
    </div>
  );
};
