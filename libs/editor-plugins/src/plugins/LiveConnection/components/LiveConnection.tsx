import { DraggableBlock } from '@decipad/editor-components';
import {
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_DATASET,
  PlateComponent,
} from '@decipad/editor-types';
import { assertElementMultipleType } from '@decipad/editor-utils';
import { useCallback, useState } from 'react';
import { LiveConnectionCore } from './LiveConnectionCore';
import { LiveConnectionResultContextProvider } from '../contexts/LiveConnectionResultContext';

const LiveConnection: PlateComponent = ({ attributes, children, element }) => {
  assertElementMultipleType(element, [
    ELEMENT_LIVE_CONNECTION,
    ELEMENT_LIVE_DATASET,
  ]);
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
