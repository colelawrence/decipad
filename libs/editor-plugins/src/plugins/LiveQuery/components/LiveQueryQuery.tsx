import {
  ELEMENT_LIVE_QUERY_QUERY,
  PlateComponent,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { LiveQueryQuery as LiveQueryQueryUI } from '@decipad/ui';
import { css } from '@emotion/react';

const hideElement = css({
  display: 'none',
});

export const LiveQueryQuery: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_LIVE_QUERY_QUERY);
  return (
    <div {...attributes} css={element.isHidden ? hideElement : undefined}>
      <LiveQueryQueryUI>{children}</LiveQueryQueryUI>
    </div>
  );
};
