import {
  useEnsureValidVariableName,
  useParentNodeEntry,
} from '@decipad/editor-hooks';
import {
  ELEMENT_LIVE_DATASET,
  ELEMENT_LIVE_DATASET_VARIABLE_NAME,
  LiveDataSetElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, isDatabaseConnection } from '@decipad/editor-utils';
import { isFlagEnabled } from '@decipad/feature-flags';
import { SourceUrlParseResponse, parseSourceUrl } from '@decipad/import';
import { useConnectionStore } from '@decipad/react-contexts';
import {
  EditableLiveDataCaption,
  LiveDataSetParams,
  TableButton,
  Tooltip,
} from '@decipad/ui';
import { css } from '@emotion/react';
import { getNodeString, setNodes } from '@udecode/plate';
import pluralize from 'pluralize';
import { useCallback, useMemo } from 'react';
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
  const parent = useParentNodeEntry<LiveDataSetElement>(element);
  if (parent) {
    assertElementType(parent[0], ELEMENT_LIVE_DATASET);
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

  const onShowDataPress = useCallback(() => {
    if (parent) {
      const [elem, path] = parent;
      setNodes(
        editor,
        { hideLiveQueryResults: !elem.hideLiveQueryResults },
        { at: path }
      );
    }
  }, [parent, editor]);

  const onOptionsPress = useCallback(() => {
    store.changeOpen(true);
  }, [store]);

  const [{ loading }] = useLiveConnectionStore(parent?.[0]) ?? {};

  const caption = (
    <div {...attributes} css={captionWrapperStyles}>
      <div css={{ display: 'flex' }}>
        <EditableLiveDataCaption
          source={sourceName}
          url={url}
          empty={getNodeString(element).length === 0}
          range={returnRange}
          loading={loading}
          isUiIntegration
        >
          {children}
        </EditableLiveDataCaption>
        <LiveDataSetCaption source={sourceName} />
      </div>

      {isFlagEnabled('LIVE_QUERY') &&
        parent &&
        isDatabaseConnection(parent[0]) && (
          <div css={tableButtonWrapperStyles}>
            <TableButton
              isInState={!parent?.[0].hideLiveQueryResults}
              isToggleButton
              onClick={onShowDataPress}
              captions={['Hide Data', 'Show Data']}
            />
          </div>
        )}
      {isFlagEnabled('LIVE_CONN_OPTIONS') && (
        <div contentEditable={false}>
          <LiveDataSetParams onClick={onOptionsPress} />
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
