/* eslint decipad/css-prop-named-variable: 0 */
import {
  Button,
  DeleteIcon,
  findNodePath,
  focusEditor,
  PlateButtonProps,
  removeNodes,
  TElement,
  useEditorRef,
} from '@udecode/plate';
import { css } from '@emotion/react';
import { plateButtonCss } from '../../styles/floating';

export const RemoveNodeButton = ({
  element,
  ...props
}: PlateButtonProps & { element: TElement }) => {
  const editor = useEditorRef();

  return (
    <Button
      css={css([
        plateButtonCss,
        css`
          padding: 4px 0;
          width: 24px;
          height: 24px;
        `,
      ])}
      onClick={() => {
        const path = findNodePath(editor, element);

        removeNodes(editor, { at: path });

        focusEditor(editor, editor.selection!);
      }}
      {...props}
    >
      <DeleteIcon />
    </Button>
  );
};
