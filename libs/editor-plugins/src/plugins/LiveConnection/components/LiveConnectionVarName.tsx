import { insertLiveQueryBelow } from '@decipad/editor-components';

import {
  useEnsureValidVariableName,
  useParentNodeEntry,
  usePathMutatorCallback,
} from '@decipad/editor-hooks';
import {
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
  LiveConnectionElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, isDatabaseConnection } from '@decipad/editor-utils';
import { isFlagEnabled } from '@decipad/feature-flags';
import { SourceUrlParseResponse, parseSourceUrl } from '@decipad/import';
import { useComputer } from '@decipad/react-contexts';
import {
  EditableLiveDataCaption,
  LiveConnectionParams,
  TableButton,
  Tooltip,
} from '@decipad/ui';
import { css } from '@emotion/react';
import { getNodeString } from '@udecode/plate';
import pluralize from 'pluralize';
import { useCallback, useMemo } from 'react';
import { useLiveConnectionPossibleJsonPaths } from '../hooks/useLiveConnectionPossibleJsonPaths';
import { useLiveConnectionStore } from '../store/liveConnectionStore';

const captionWrapperStyles = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '8px',
});

const tableButtonWrapperStyles = css({
  marginBottom: '8px',
  marginTop: '-5px',
  marginLeft: '-5px',
});

export const LiveConnectionVarName: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  assertElementType(element, ELEMENT_LIVE_CONNECTION_VARIABLE_NAME);
  const editor = useTEditorRef();
  const parent = useParentNodeEntry<LiveConnectionElement>(element);
  if (parent) {
    assertElementType(parent[0], ELEMENT_LIVE_CONNECTION);
  }

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
  const setJsonPath = usePathMutatorCallback(editor, parent?.[1], 'jsonPath');
  const setUrl = usePathMutatorCallback(editor, parent?.[1], 'url');
  const setSource = usePathMutatorCallback(editor, parent?.[1], 'source');
  const setDelimiter = usePathMutatorCallback(editor, parent?.[1], 'delimiter');

  const computer = useComputer();

  const onCreateQueryPress = useCallback(() => {
    if (parent) {
      insertLiveQueryBelow(
        editor,
        parent[1],
        computer.getAvailableIdentifier.bind(computer),
        parent[0].id
      );
    }
  }, [computer, editor, parent]);

  const [{ loading }] = useLiveConnectionStore(parent?.[0]) ?? {};

  const caption = (
    <div {...attributes} css={captionWrapperStyles}>
      <EditableLiveDataCaption
        source={sourceName}
        url={url}
        empty={getNodeString(element).length === 0}
        range={returnRange}
        loading={loading}
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
            delimiter={parent?.[0].delimiter}
            setDelimiter={setDelimiter}
          />
        </div>
      )}
      {isFlagEnabled('LIVE_QUERY') &&
        parent &&
        isDatabaseConnection(parent[0]) && (
          <div css={tableButtonWrapperStyles}>
            <TableButton
              onClick={onCreateQueryPress}
              captions={['Create query']}
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
