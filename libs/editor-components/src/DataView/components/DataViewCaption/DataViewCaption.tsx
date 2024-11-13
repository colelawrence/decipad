import { useEnsureValidVariableName } from '@decipad/editor-hooks';
import type { DataViewElement, PlateComponent } from '@decipad/editor-types';
import {
  ELEMENT_DATA_VIEW,
  ELEMENT_DATA_VIEW_CAPTION,
  useMyEditorRef,
} from '@decipad/editor-types';
import { assertElementType, getAboveNodeSafe } from '@decipad/editor-utils';
import { Tooltip } from '@decipad/ui';
import { findNodePath, isElement } from '@udecode/plate-common';

export const DataViewCaption: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  assertElementType(element, ELEMENT_DATA_VIEW_CAPTION);
  const editor = useMyEditorRef();
  const path = findNodePath(editor, element);
  const parent = getAboveNodeSafe<DataViewElement>(editor, {
    at: path,
    match: (node) => {
      return isElement(node) && node.type === ELEMENT_DATA_VIEW;
    },
  });

  const tableBlockId = parent?.[0].id;
  const firstThId = parent?.[0].id;

  // ensure name is unique
  const varNameElement = element.children[0];
  const tooltip = useEnsureValidVariableName(varNameElement, [
    tableBlockId,
    firstThId,
  ]);

  const caption = <div {...attributes}>{children}</div>;

  return tooltip ? (
    <Tooltip side="left" hoverOnly open trigger={caption}>
      {tooltip}
    </Tooltip>
  ) : (
    caption
  );
};
