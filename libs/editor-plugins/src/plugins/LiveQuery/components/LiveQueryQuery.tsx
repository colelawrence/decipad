import {
  ELEMENT_LIVE_QUERY_QUERY,
  PlateComponent,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { LiveQueryQuery as LiveQueryQueryUI } from '@decipad/ui';

export const LiveQueryQuery: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_LIVE_QUERY_QUERY);
  return (
    <div {...attributes}>
      <LiveQueryQueryUI>{children}</LiveQueryQueryUI>
    </div>
  );
};
