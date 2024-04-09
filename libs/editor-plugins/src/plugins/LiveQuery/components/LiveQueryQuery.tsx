import type { PlateComponent } from '@decipad/editor-types';
import {
  ELEMENT_LIVE_QUERY_QUERY,
  useMyEditorRef,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { LiveQueryQuery as LiveQueryQueryUI } from '@decipad/ui';
import { css } from '@emotion/react';
import { LiveQueryAIPanel } from '@decipad/editor-components';
import { useContext } from 'react';
import { insertText, findNodePath } from '@udecode/plate-common';
import { useComputer } from '@decipad/react-contexts';
import { AIPanelContext } from './LiveQuery';
import { useLiveConnectionUrl } from '../hooks/useLiveConnectionUrl';

const hideElement = css({
  display: 'none',
});

export const LiveQueryQuery: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  const { showAiPanel, toggle } = useContext(AIPanelContext);

  assertElementType(element, ELEMENT_LIVE_QUERY_QUERY);
  const editor = useMyEditorRef();

  const computer = useComputer();
  const url = useLiveConnectionUrl(element, computer);
  // HACK to get url id
  const urlFragments = url?.split('/') || [];
  const id = urlFragments ? urlFragments[urlFragments.length - 2] : undefined;

  return id !== undefined ? (
    <div {...attributes} css={element.isHidden ? hideElement : undefined}>
      {showAiPanel && (
        <LiveQueryAIPanel
          id={id}
          toggle={toggle}
          updateQueryText={(query: string) => {
            insertText(editor, query, { at: findNodePath(editor, element) });
          }}
        />
      )}
      <LiveQueryQueryUI>{children}</LiveQueryQueryUI>
    </div>
  ) : null;
};
