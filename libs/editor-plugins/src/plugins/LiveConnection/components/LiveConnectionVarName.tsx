import {
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
  LiveConnectionElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  useEnsureValidVariableName,
  useNodePath,
} from '@decipad/editor-utils';
import { parseSourceUrl, SourceUrlParseResponse } from '@decipad/import';
import { EditableLiveDataCaption, Tooltip } from '@decipad/ui';
import { getDefined } from '@decipad/utils';
import { getNodeString, getParentNode } from '@udecode/plate';
import pluralize from 'pluralize';
import { useMemo } from 'react';

export const LiveConnectionVarName: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  assertElementType(element, ELEMENT_LIVE_CONNECTION_VARIABLE_NAME);
  const path = useNodePath(element);
  const editor = useTEditorRef();
  const parent = useMemo(
    () => path && getParentNode<LiveConnectionElement>(editor, path),
    [editor, path]
  );

  const { sourceName, url, returnRange } = useMemo(() => {
    const source = parent?.[0].source ?? '';
    const parentUrl = getDefined(parent?.[0].url);

    const sourceParams: SourceUrlParseResponse = (source &&
      parentUrl &&
      parseSourceUrl(source, parentUrl)) || { userUrl: parentUrl };

    const { isRange, range, subsheetName, userUrl } = sourceParams;
    const formattedRange = range?.join(':') || '';
    const rangeExplanation =
      subsheetName && subsheetName !== '0'
        ? `(${subsheetName}${isRange ? `, ${formattedRange}` : ''})`
        : '';
    return {
      url: userUrl,
      sourceName: `${pluralize.singular(source)} ${rangeExplanation}`,
      returnRange: subsheetName && subsheetName !== '0' ? formattedRange : '',
    };
  }, [parent]);

  // ensure var name is unique
  const tooltip = useEnsureValidVariableName(element, parent?.[0].id);

  const caption = (
    <div {...attributes}>
      <EditableLiveDataCaption
        source={sourceName}
        url={url}
        empty={getNodeString(element).length === 0}
        range={returnRange}
      >
        {children}
      </EditableLiveDataCaption>
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
