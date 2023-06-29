import {
  ELEMENT_LIVE_QUERY_VARIABLE_NAME,
  LiveQueryElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import {
  useEnsureValidVariableName,
  useParentNodeEntry,
  usePathMutatorCallback,
} from '@decipad/editor-hooks';
import {
  EditableLiveDataCaption,
  Tooltip,
  VariableNameSelector,
  icons,
} from '@decipad/ui';
import { getNodeString } from '@udecode/plate';
import { css } from '@emotion/react';
import { useSourceLiveConnections } from '../hooks/useSourceLiveConnections';

const captionWrapperStyles = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '4px',
});

const hideElement = css({
  display: 'none',
});

export const LiveQueryVarName: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  assertElementType(element, ELEMENT_LIVE_QUERY_VARIABLE_NAME);
  const editor = useTEditorRef();
  const parent = useParentNodeEntry<LiveQueryElement>(element);

  // ensure var name is unique
  const tooltip = useEnsureValidVariableName(element, [parent?.[0].id]);
  const caption = (
    <div
      {...attributes}
      css={element.isHidden ? hideElement : captionWrapperStyles}
    >
      <EditableLiveDataCaption
        icon={<icons.Code />}
        empty={getNodeString(element).length === 0}
      >
        {children}
      </EditableLiveDataCaption>
      <VariableNameSelector
        label="Source:"
        variableNames={useSourceLiveConnections()}
        selectedVariableName={parent?.[0].connectionBlockId}
        onChangeVariableName={usePathMutatorCallback(
          editor,
          parent?.[1],
          'connectionBlockId',
          'LiveQueryVarName'
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
