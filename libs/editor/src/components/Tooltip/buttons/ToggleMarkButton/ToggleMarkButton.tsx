import {
  getPreventDefaultHandler,
  isMarkActive,
  toggleMark,
} from '@udecode/plate';
import { FC, useState } from 'react';
import { MyMark, useTEditorRef } from '@decipad/editor-types';
import { FloatingButton } from '@decipad/ui';
import { useEditorChange } from '@decipad/react-contexts';
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
      <FloatingButton
        className="toggle"
        isActive={active}
        onMouseDown={(e) => {
          if (editor) {
            setActive(!active);
            getPreventDefaultHandler(toggleMark, editor, { key: type })(e);
          }
        }}
      >
        {icon}
      </FloatingButton>
    </>
  );
};
