import {
  ELEMENT_LIVE_QUERY_VARIABLE_NAME,
  LiveQueryElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  usePathMutatorCallback,
  useEnsureValidVariableName,
} from '@decipad/editor-utils';
import { useEditorChange } from '@decipad/react-contexts';
import {
  EditableLiveDataCaption,
  Tooltip,
  VariableNameSelector,
  icons,
} from '@decipad/ui';
import { findNodePath, getNodeString, getParentNode } from '@udecode/plate';
import { useCallback, useState } from 'react';
import { NodeEntry } from 'slate';
import { css } from '@emotion/react';
import { useSourceLiveConnections } from '../hooks/useSourceLiveConnections';

const captionWrapperStyles = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '4px',
});

export const LiveQueryVarName: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  assertElementType(element, ELEMENT_LIVE_QUERY_VARIABLE_NAME);
  const editor = useTEditorRef();
  const [parent, setParent] = useState<
    NodeEntry<LiveQueryElement> | undefined
  >();
  useEditorChange(
    setParent,
    useCallback(
      (ed) => {
        const path = findNodePath(ed, element);
        if (path) {
          return getParentNode<LiveQueryElement>(editor, path);
        }
        return undefined;
      },
      [editor, element]
    )
  );

  // ensure var name is unique
  const tooltip = useEnsureValidVariableName(element, [parent?.[0].id]);

  const caption = (
    <div {...attributes} css={captionWrapperStyles}>
      <EditableLiveDataCaption
        icon={<icons.Code />}
        empty={getNodeString(element).length === 0}
      >
        {children}
      </EditableLiveDataCaption>
      <VariableNameSelector
        label="Source"
        variableNames={useSourceLiveConnections()}
        selectedVariableName={parent?.[0].connectionBlockId}
        onChangeVariableName={usePathMutatorCallback(
          editor,
          parent?.[1],
          'connectionBlockId'
        )}
      />
    </div>
  );

  return tooltip ? (
    <Tooltip side="left" hoverOnly open trigger={caption}>
      {tooltip}
    </Tooltip>
  ) : (
    caption
  );
};
