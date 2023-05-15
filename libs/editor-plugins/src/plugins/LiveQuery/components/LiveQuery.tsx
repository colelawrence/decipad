import { useCallback, useState } from 'react';
import { DraggableBlock } from '@decipad/editor-components';
import {
  ELEMENT_LIVE_QUERY,
  LiveDataSetElement,
  PlateComponent,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useParentNode } from '@decipad/editor-hooks';
import { LiveQueryCore } from './LiveQueryCore';

const LiveQuery: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_LIVE_QUERY);
  const [deleted, setDeleted] = useState(false);
  const onceDeleted = useCallback(() => setDeleted(true), []);
  const parent = useParentNode<LiveDataSetElement>(element);

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
        showLiveQueryResults={!parent?.hideLiveQueryResults}
      />
    </DraggableBlock>
  );
};

// use export default for React.lazy
export default LiveQuery;
