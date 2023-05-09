import { useCallback, useMemo, useState } from 'react';
import { NodeEntry } from 'slate';
import { css } from '@emotion/react';
import {
  ELEMENT_LIVE_DATASET_VARIABLE_NAME,
  LiveDataSetElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  isDatabaseConnection,
  useEnsureValidVariableName,
} from '@decipad/editor-utils';
import { parseSourceUrl, SourceUrlParseResponse } from '@decipad/import';
import { useConnectionStore, useEditorChange } from '@decipad/react-contexts';
import {
  EditableLiveDataCaption,
  LiveDataSetParams,
  Spinner,
  TableButton,
  Tooltip,
} from '@decipad/ui';
import {
  findNodePath,
  getNodeString,
  getParentNode,
  setNodes,
} from '@udecode/plate';
import pluralize from 'pluralize';
import { isFlagEnabled } from '@decipad/feature-flags';
import { useLiveConnectionStore } from '../store/liveConnectionStore';
import LiveDataSetCaption from './LiveDataSetCaption';

const captionWrapperStyles = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '8px',
});

const tableButtonWrapperStyles = css({
  marginBottom: '8px',
  marginTop: '-5px',
  marginLeft: 'auto',
});

export const LiveDataSetVarName: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  assertElementType(element, ELEMENT_LIVE_DATASET_VARIABLE_NAME);

  const store = useConnectionStore();
  const editor = useTEditorRef();
  // refactor to useeditorselector
  const [parent, setParent] = useState<
    NodeEntry<LiveDataSetElement> | undefined
  >();
  useEditorChange(
    setParent,
    useCallback(
      (ed) => {
        const path = findNodePath(ed, element);
        if (path) {
          return getParentNode<LiveDataSetElement>(editor, path);
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

  const onShowDataPress = () => {
    if (parent) {
      const [elem, path] = parent;
      setNodes(
        editor,
        { hideLiveryQueryResults: !elem.hideLiveryQueryResults },
        { at: path }
      );
    }
  };

  const onOptionsPress = () => {
    store.changeOpen(true);
  };

  const [{ loading }] = useLiveConnectionStore(parent?.[0]) ?? {};

  const caption = (
    <>
      <div {...attributes} css={captionWrapperStyles}>
        <EditableLiveDataCaption
          source={sourceName}
          url={url}
          empty={getNodeString(element).length === 0}
          range={returnRange}
          isUiIntegration={true}
        >
          {children}
        </EditableLiveDataCaption>
        <LiveDataSetCaption source={sourceName} />
        {isFlagEnabled('LIVE_QUERY') &&
          parent &&
          isDatabaseConnection(parent[0]) && (
            <>
              <div css={tableButtonWrapperStyles}>
                <TableButton
                  isInState={!parent?.[0].hideLiveryQueryResults}
                  isToggleButton={true}
                  onClick={onShowDataPress}
                  captions={['Hide Data', 'Show Data']}
                />
              </div>
            </>
          )}
        {isFlagEnabled('LIVE_CONN_OPTIONS') && (
          <div contentEditable={false}>
            <LiveDataSetParams onClick={onOptionsPress} />
          </div>
        )}
        {loading && <Spinner />}
      </div>
    </>
  );

  return tooltip ? (
    <Tooltip side="left" hoverOnly open trigger={caption}>
      {tooltip}
    </Tooltip>
  ) : (
    caption
  );
};
