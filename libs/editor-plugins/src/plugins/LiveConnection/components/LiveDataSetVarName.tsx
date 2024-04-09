import {
  useEnsureValidVariableName,
  useParentNodeEntry,
} from '@decipad/editor-hooks';
import type { LiveDataSetElement, PlateComponent } from '@decipad/editor-types';
import {
  ELEMENT_LIVE_DATASET,
  ELEMENT_LIVE_DATASET_VARIABLE_NAME,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { isFlagEnabled } from '@decipad/feature-flags';
import type { SourceUrlParseResponse } from '@decipad/import';
import { parseSourceUrl } from '@decipad/import';
import { useConnectionStore } from '@decipad/react-contexts';
import {
  EditableLiveDataCaption,
  LiveDataSetParams,
  Tooltip,
} from '@decipad/ui';
import { css } from '@emotion/react';
import { getNodeString } from '@udecode/plate-common';
import pluralize from 'pluralize';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { map } from 'rxjs';
import { useLiveConnectionResult$ } from '../contexts/LiveConnectionResultContext';
import LiveDataSetCaption from './LiveDataSetCaption';

const captionWrapperStyles = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '8px',
});

export const LiveDataSetVarName: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  assertElementType(element, ELEMENT_LIVE_DATASET_VARIABLE_NAME);

  const { changeOpen } = useConnectionStore();
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

  const onOptionsPress = useCallback(() => {
    changeOpen(true);
  }, [changeOpen]);

  const [loading, setLoading] = useState(false);
  const result$ = useLiveConnectionResult$();
  useEffect(() => {
    if (!result$) {
      return;
    }
    const sub = result$
      .pipe(map((r) => r.result.loading))
      .subscribe(setLoading);

    return () => sub.unsubscribe();
  }, [result$]);

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
