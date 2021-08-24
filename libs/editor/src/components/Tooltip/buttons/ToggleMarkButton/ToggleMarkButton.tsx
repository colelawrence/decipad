import { css } from '@emotion/react';
import {
  getPreventDefaultHandler,
  isMarkActive,
  toggleMark,
  useEventEditorId,
  useStoreEditorState,
} from '@udecode/plate';
import { FC } from 'react';
import { dividerStyle } from '../../styles/divider';

const buttonStyles = css({
  backgroundColor: 'transparent',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  borderRadius: '3px',
  padding: '0 8px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease-out',
  '&:hover': {
    backgroundColor: '#f0f0f2',
  },
  '> div > svg > path': {
    stroke: 'rgb(137, 137, 142)',
    transition: 'stroke 0.2s ease-out',
  },
});

const activeButtonStyles = css({
  '> div > svg > path': {
    stroke: 'rgb(18, 18, 20)',
    strokeWidth: '2',
  },
});

interface ToggleMarkButtonProps {
  type: string;
  icon: ReturnType<FC>;
  divider?: boolean;
}

export const ToggleMarkButton = ({
  type,
  icon,
  divider,
}: ToggleMarkButtonProps): ReturnType<FC> => {
  const editor = useStoreEditorState(useEventEditorId('focus'));

  const isActive = !!editor?.selection && isMarkActive(editor, type);

  return (
    <>
      {divider && <div css={dividerStyle} />}
      <button
        css={[buttonStyles, isActive && activeButtonStyles]}
        onMouseDown={
          editor
            ? getPreventDefaultHandler(toggleMark, editor, type)
            : undefined
        }
      >
        {icon}
      </button>
    </>
  );
};
