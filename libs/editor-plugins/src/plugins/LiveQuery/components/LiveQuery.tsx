import { DraggableBlock } from '@decipad/editor-components';
import {
  ELEMENT_LIVE_QUERY,
  LiveDataSetElement,
  PlateComponent,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useEditorChange } from '@decipad/react-contexts';
import { findNodePath, getParentNode } from '@udecode/plate';
import { useCallback, useState } from 'react';
import { LiveQueryCore } from './LiveQueryCore';

const LiveQuery: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_LIVE_QUERY);
  const [deleted, setDeleted] = useState(false);
  const onceDeleted = useCallback(() => setDeleted(true), []);

  const [parent, setParent] = useState<LiveDataSetElement | undefined>();

  useEditorChange(
    setParent,
    useCallback(
      (editor) => {
        const path = findNodePath(editor, element);
        if (path) {
          const parentEntry = getParentNode<LiveDataSetElement>(
            editor,
            path
          )?.[0];
          return parentEntry;
        }
        return undefined;
      },
      [element]
    )
  );

  return (
    <DraggableBlock
      blockKind="editorTable"
      element={element}
      {...attributes}
      onceDeleted={onceDeleted}
      dependencyId={element.id}
    >
      {children}
      <LiveQueryCore
        element={element}
        deleted={deleted}
        showLiveQueryResults={!parent?.hideLiveryQueryResults}
      />
    </DraggableBlock>
  );
};

// use export default for React.lazy
export default LiveQuery;
