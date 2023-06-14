import { useCallback, useState, createContext } from 'react';
import { DraggableBlock } from '@decipad/editor-components';
import {
  ELEMENT_LIVE_QUERY,
  LiveDataSetElement,
  PlateComponent,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useParentNode } from '@decipad/editor-hooks';
import { LiveQueryCore } from './LiveQueryCore';
import { getAnalytics } from '@decipad/client-events';

const analytics = getAnalytics();

export const AIPanelContext = createContext({
  showAiPanel: false,
  toggle: () => {},
});

const LiveQuery: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_LIVE_QUERY);
  const [deleted, setDeleted] = useState(false);
  const onceDeleted = useCallback(() => setDeleted(true), []);
  const parent = useParentNode<LiveDataSetElement>(element);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const toggleAiPanel = useCallback(() => {
    if (analytics) {
      analytics.track('Opening live query AI panel');
    }
    setShowAiPanel((t) => !t);
  }, [setShowAiPanel]);

  return (
    <DraggableBlock
      blockKind="editorTable"
      element={element}
      {...attributes}
      onceDeleted={onceDeleted}
      dependencyId={element.id}
      aiPanel={{
        text: 'Generate query with AI',
        visible: showAiPanel,
        toggle: toggleAiPanel,
      }}
    >
      <AIPanelContext.Provider value={{ showAiPanel, toggle: toggleAiPanel }}>
        {children}
      </AIPanelContext.Provider>
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
