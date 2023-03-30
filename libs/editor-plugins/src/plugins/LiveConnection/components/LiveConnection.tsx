import { DraggableBlock } from '@decipad/editor-components';
import { ELEMENT_LIVE_CONNECTION, PlateComponent } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useCallback, useState } from 'react';
import { LiveConnectionCore } from './LiveConnectionCore';
import { LiveConnectionResultContextProvider } from '../contexts/LiveConnectionResultContext';

const LiveConnection: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_LIVE_CONNECTION);
  const [deleted, setDeleted] = useState(false);
  const onceDeleted = useCallback(() => setDeleted(true), []);

  return (
    <DraggableBlock
      blockKind="editorTable"
      element={element}
      {...attributes}
      onceDeleted={onceDeleted}
      dependencyId={element.id}
    >
      <LiveConnectionResultContextProvider>
        {children}
        <LiveConnectionCore element={element} deleted={deleted} />
      </LiveConnectionResultContextProvider>
    </DraggableBlock>
  );
};

// use export default for React.lazy
export default LiveConnection;
