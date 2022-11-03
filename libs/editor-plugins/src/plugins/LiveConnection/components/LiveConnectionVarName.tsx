import { useMemo } from 'react';
import { getParentNode } from '@udecode/plate';
import {
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
  LiveConnectionElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { assertElementType, useNodePath } from '@decipad/editor-utils';
import { EditableLiveDataCaption } from '@decipad/ui';
import { parseSourceUrl, SourceUrlParseResponse } from '@decipad/import';
import pluralize from 'pluralize';

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

  const { sourceName, url } = useMemo(() => {
    const source = parent?.[0].source ?? '';
    const parentUrl = getDefined(parent?.[0].url);

    const sourceParams: SourceUrlParseResponse = (source &&
      parentUrl &&
      parseSourceUrl(source, parentUrl)) || { userUrl: parentUrl };

    const { isRange, range, subsheetName, userUrl } = sourceParams;
    const rangeExplanation =
      subsheetName && subsheetName !== '0'
        ? `(${subsheetName}${isRange ? `, from ${range?.join(' to ')}` : ''})`
        : '';
    return {
      url: userUrl,
      sourceName: `${pluralize.singular(source)} ${rangeExplanation}`,
    };
  }, [parent]);

  return (
    <div {...attributes}>
      <EditableLiveDataCaption source={sourceName} url={url}>
        {children}
      </EditableLiveDataCaption>
    </div>
  );
};
