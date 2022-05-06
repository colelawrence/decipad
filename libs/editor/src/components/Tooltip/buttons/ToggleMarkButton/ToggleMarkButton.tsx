import { css } from '@emotion/react';
import {
  getPreventDefaultHandler,
  isMarkActive,
  toggleMark,
  useEditorRef,
} from '@udecode/plate';
import { cssVar } from 'libs/ui/src/primitives';
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
    backgroundColor: `${cssVar('highlightColor')}`,
  },
  '> div > svg > path': {
    transition: 'stroke 0.2s ease-out',
  },
});

const activeButtonStyles = css({
  '> div > svg > path': {
    stroke: `${cssVar('normalTextColor')}`,
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
  const editor = useEditorRef();

  const isActive = !!editor?.selection && isMarkActive(editor, type);

  return (
    <>
      {divider && <div css={dividerStyle} />}
      <button
        className="toggle"
        css={[buttonStyles, isActive && activeButtonStyles]}
        onMouseDown={
          editor
            ? getPreventDefaultHandler(toggleMark, editor, { key: type })
            : undefined
        }
      >
        {icon}
      </button>
    </>
  );
};
