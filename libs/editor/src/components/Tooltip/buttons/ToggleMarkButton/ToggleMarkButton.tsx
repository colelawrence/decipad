import { isMarkActive, toggleMark } from '@udecode/plate';
import { FC, useState } from 'react';
import { MyMark, useTEditorRef } from '@decipad/editor-types';
import { FloatingButton } from '@decipad/ui';
import { useEditorChange } from '@decipad/editor-hooks';
import { dividerStyle } from '../../styles/divider';

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
  const editorActive = useEditorChange(
    () => !!editor?.selection && isMarkActive(editor, type)
  );
  const [active, setActive] = useState(editorActive);

  return (
    <>
      {divider && <div css={dividerStyle} />}
      <FloatingButton
        className="toggle"
        isActive={editorActive || active}
        onMouseDown={(e) => {
          if (editor) {
            setActive(!active);
            e.preventDefault();
            e.stopPropagation();
            toggleMark(editor, { key: type });
          }
        }}
      >
        {icon}
      </FloatingButton>
    </>
  );
};
