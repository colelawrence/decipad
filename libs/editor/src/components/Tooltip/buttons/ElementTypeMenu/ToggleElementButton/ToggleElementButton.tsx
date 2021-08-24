import { css } from '@emotion/react';
import { FC } from 'react';
import { useEditorTooltip } from '../../../hooks/useEditorTooltip';

const buttonStyles = css({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'flex-start',
  border: 'none',
  backgroundColor: 'transparent',
  padding: '6px',
  borderRadius: '6px',
  cursor: 'pointer',
  gap: '12px',
  color: '#111',
  fontSize: '14px',
  transition: 'background-color 0.2s ease-out',
  '&:hover': {
    backgroundColor: '#f0f0f2',
    '> span': {
      backgroundColor: 'white',
    },
  },
  '&:active': {
    color: '#111',
  },
});

const iconStyles = css({
  width: '28px',
  height: '28px',
  display: 'grid',
  placeItems: 'center',
  backgroundColor: 'transparent',
  transition: 'background-color 0.2s ease-out',
  background: '#f0f0f2',
  borderRadius: '3px',
  fontSize: '13px',
  fontWeight: 'bold',
});

interface ToggleElementButtonProps {
  type: string;
  label: string;
  currentBlockType: string | null;
}

export const ToggleElementButton = ({
  type,
  label,
  currentBlockType,
}: ToggleElementButtonProps): ReturnType<FC> => {
  const { toggleElementType } = useEditorTooltip();

  const active = currentBlockType === type;

  return (
    <li>
      <button
        css={[buttonStyles, active && css({ display: 'none' })]}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleElementType(type);
        }}
      >
        <span css={iconStyles}>Aa</span>
        {label}
      </button>
    </li>
  );
};
