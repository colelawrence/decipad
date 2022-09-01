import { useMemo } from 'react';
import { getParentNode } from '@udecode/plate';
import {
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
  LiveConnectionElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, useNodePath } from '@decipad/editor-utils';
import { molecules } from '@decipad/ui';

export const LiveConnectionVarName: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  assertElementType(element, ELEMENT_LIVE_CONNECTION_VARIABLE_NAME);
  const path = useNodePath(element);
  const editor = useTEditorRef();
  const parent = useMemo(
    () => path && getParentNode<LiveConnectionElement>(editor, path),
    [editor, path]
  );
  return (
    <div {...attributes}>
      <molecules.EditableLiveDataCaption
        source={parent?.[0].source}
        url={parent?.[0].url}
      >
        {children}
      </molecules.EditableLiveDataCaption>
    </div>
  );
};
