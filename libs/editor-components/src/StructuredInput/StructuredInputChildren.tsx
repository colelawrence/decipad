import {
  ELEMENT_STRUCTURED_IN_CHILD,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, getAboveNodeSafe } from '@decipad/editor-utils';
import { cssVar, p14Medium } from '@decipad/ui';
import { css } from '@emotion/react';
import { findNodePath } from '@udecode/plate';
import { BlockLengthSynchronizationReceiver } from '../BlockLengthSynchronization/BlockLengthSynchronizationReceiver';

const structuredInputChildrenStyles = css({
  borderRight: `1px solid ${cssVar('borderColor')}`,
  borderLeft: `1px solid ${cssVar('borderColor')}`,
  padding: '8px',
  display: 'flex',
  justifyContent: 'end',
  alignItems: 'center',
  minWidth: '100px',
});

export const StructuredInputChildren: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  assertElementType(element, ELEMENT_STRUCTURED_IN_CHILD);
  const editor = useTEditorRef();
  const path = findNodePath(editor, element);
  const parent = getAboveNodeSafe(editor, { at: path });

  return (
    <div css={structuredInputChildrenStyles}>
      <BlockLengthSynchronizationReceiver
        syncGroupName="resultColumn"
        topLevelBlockId={parent ? parent[0].id : ''}
      >
        <span
          {...attributes}
          id={element.id}
          css={{
            display: 'block',
            textAlign: 'end',
            fontSize: p14Medium.fontSize,
          }}
        >
          {children}
        </span>
      </BlockLengthSynchronizationReceiver>
    </div>
  );
};
