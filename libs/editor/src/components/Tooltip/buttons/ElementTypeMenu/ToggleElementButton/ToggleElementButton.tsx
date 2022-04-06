import { css } from '@emotion/react';
import { grey100 } from 'libs/ui/src/primitives';
import { FC, MouseEventHandler, ReactNode } from 'react';
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
  width: '24px',
  height: '24px',
  display: 'grid',
  placeItems: 'center',
  backgroundColor: 'transparent',
  transition: 'background-color 0.2s ease-out',
  background: grey100.rgb,
  borderRadius: '3px',
});

interface ToggleElementButtonProps {
  type: string;
  label: string;
  icon: ReactNode;
  currentBlockType: string | null;
  onMouseDown?: MouseEventHandler<HTMLButtonElement>;
}

export const ToggleElementButton = ({
  type,
  label,
  icon,
  currentBlockType,
  onMouseDown,
}: ToggleElementButtonProps): ReturnType<FC> => {
  const { toggleElementType } = useEditorTooltip();

  const active = currentBlockType === type;

  return (
    <li>
      <button
        className="toggle"
        css={[buttonStyles, active && css({ display: 'none' })]}
        onMouseDown={
          onMouseDown ||
          ((e) => {
            e.preventDefault();
            toggleElementType(type);
          })
        }
      >
        <span css={iconStyles}>{icon}</span>
        {label}
      </button>
    </li>
  );
};
