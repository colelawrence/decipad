import { useEnsureValidVariableName } from '@decipad/editor-hooks';
import type { TimeSeriesElement, PlateComponent } from '@decipad/editor-types';
import {
  ELEMENT_TIME_SERIES,
  ELEMENT_TIME_SERIES_CAPTION,
  useMyEditorRef,
} from '@decipad/editor-types';
import { assertElementType, getAboveNodeSafe } from '@decipad/editor-utils';
import { Tooltip } from '@decipad/ui';
import { findNodePath, isElement } from '@udecode/plate-common';

export const TimeSeriesCaption: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  assertElementType(element, ELEMENT_TIME_SERIES_CAPTION);
  const editor = useMyEditorRef();
  const path = findNodePath(editor, element);
  const parent = getAboveNodeSafe<TimeSeriesElement>(editor, {
    at: path,
    match: (node) => {
      return isElement(node) && node.type === ELEMENT_TIME_SERIES;
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
