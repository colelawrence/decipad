import { css } from '@emotion/react';
import {
  getPreventDefaultHandler,
  isMarkActive,
  toggleMark,
} from '@udecode/plate';
import { cssVar } from 'libs/ui/src/primitives';
import { FC, useState } from 'react';
import { MyMark, useTEditorRef } from '@decipad/editor-types';
import { useEditorChange } from '@decipad/react-contexts';
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
  type: MyMark;
  icon: ReturnType<FC>;
  divider?: boolean;
}

export const ToggleMarkButton = ({
  type,
  icon,
  divider,
}: ToggleMarkButtonProps): ReturnType<FC> => {
  const editor = useTEditorRef();

  const [active, setActive] = useState(
    !!editor?.selection && isMarkActive(editor, type)
  );

  useEditorChange(
    (result: boolean) => {
      setActive(result);
    },
    () => !!editor?.selection && isMarkActive(editor, type)
  );

  return (
    <>
      {divider && <div css={dividerStyle} />}
      <button
        className="toggle"
        css={[buttonStyles, active && activeButtonStyles]}
        onMouseDown={(e) => {
          if (editor) {
            setActive(!active);
            getPreventDefaultHandler(toggleMark, editor, { key: type })(e);
          }
        }}
      >
        {icon}
      </button>
    </>
  );
};
