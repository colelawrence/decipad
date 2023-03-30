import {
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
  LiveConnectionElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  useElementMutatorCallback,
  useEnsureValidVariableName,
} from '@decipad/editor-utils';
import { parseSourceUrl, SourceUrlParseResponse } from '@decipad/import';
import { useEditorChange } from '@decipad/react-contexts';
import {
  EditableLiveDataCaption,
  LiveConnectionParams,
  Tooltip,
} from '@decipad/ui';
import { findNodePath, getNodeString, getParentNode } from '@udecode/plate';
import pluralize from 'pluralize';
import { useCallback, useMemo, useState } from 'react';
import { NodeEntry } from 'slate';
import { isFlagEnabled } from '@decipad/feature-flags';
import { css } from '@emotion/react';
import { useLiveConnectionPossibleJsonPaths } from '../hooks/useLiveConnectionPossibleJsonPaths';

const captionWrapperStyles = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '4px',
});

export const LiveConnectionVarName: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  assertElementType(element, ELEMENT_LIVE_CONNECTION_VARIABLE_NAME);
  const editor = useTEditorRef();
  const [parent, setParent] = useState<
    NodeEntry<LiveConnectionElement> | undefined
  >();
  useEditorChange(
    setParent,
    useCallback(
      (ed) => {
        const path = findNodePath(ed, element);
        if (path) {
          return getParentNode<LiveConnectionElement>(editor, path);
        }
        return undefined;
      },
      [editor, element]
    )
  );

  const { sourceName, url, returnRange } = useMemo(() => {
    const source = parent?.[0].source ?? '';
    const parentUrl = parent?.[0].url;

    const sourceParams: SourceUrlParseResponse | undefined =
      (source &&
        parentUrl != null &&
        !parent?.[0].externalDataSourceId &&
        parseSourceUrl(source, parentUrl)) ||
      (parentUrl != null && { userUrl: parentUrl }) ||
      undefined;

    const { isRange, range, subsheetName, userUrl } = sourceParams || {};
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
  const tooltip = useEnsureValidVariableName(element, [parent?.[0].id]);

  const possibleJsonPaths = useLiveConnectionPossibleJsonPaths();
  const setJsonPath = useElementMutatorCallback(
    editor,
    parent?.[0],
    'jsonPath'
  );
  const setUrl = useElementMutatorCallback(editor, parent?.[0], 'url');
  const setSource = useElementMutatorCallback(editor, parent?.[0], 'source');

  const caption = (
    <div {...attributes} css={captionWrapperStyles}>
      <EditableLiveDataCaption
        source={sourceName}
        url={url}
        empty={getNodeString(element).length === 0}
        range={returnRange}
      >
        {children}
      </EditableLiveDataCaption>
      {isFlagEnabled('LIVE_CONN_OPTIONS') && (
        <div contentEditable={false}>
          <LiveConnectionParams
            jsonPath={parent?.[0].jsonPath ?? ''}
            possibleJsonPaths={possibleJsonPaths}
            setJsonPath={setJsonPath}
            url={parent?.[0].url ?? ''}
            setUrl={setUrl}
            source={parent?.[0].source}
            setSource={setSource}
          />
        </div>
      )}
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
