import { insertLiveQueryBelow } from '@decipad/editor-components';

import {
  useParentNodeEntry,
  usePathMutatorCallback,
} from '@decipad/editor-hooks';
import {
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
  ImportElementSourcePretty,
  LiveConnectionElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, isDatabaseConnection } from '@decipad/editor-utils';
import { getDefined } from '@decipad/utils';
import { isFlagEnabled } from '@decipad/feature-flags';
import { SourceUrlParseResponse, parseSourceUrl } from '@decipad/import';
import { useComputer } from '@decipad/react-contexts';
import { removeFocusFromAllBecauseSlate } from '@decipad/react-utils';
import {
  ImportTableFirstRowControls,
  TableButton,
  IntegrationBlock as UIIntegrationBlock,
} from '@decipad/ui';
import { css } from '@emotion/react';
import { Hide, Show } from 'libs/ui/src/icons';
import { useCallback, useMemo, useState } from 'react';
import { useLiveConnectionCore } from '../hooks/useLiveConnectionCore';

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
  // code from @pgte im not sure should be here or if line above was enough?
  // const path = findNodePath(editor, element);
  // const parent = path && getParentNode(editor, path);
  if (parent) {
    assertElementType(parent[0], ELEMENT_LIVE_CONNECTION);
  }
  const setIsFirstRowHeader = usePathMutatorCallback<
    LiveConnectionElement,
    'isFirstRowHeaderRow'
  >(editor, parent?.[1], 'isFirstRowHeaderRow');

  const isFirstRowHeaderRow = parent?.[0].isFirstRowHeaderRow;

  const toggleFirstRowIsHeader = useCallback(() => {
    setIsFirstRowHeader(!isFirstRowHeaderRow);
  }, [isFirstRowHeaderRow, setIsFirstRowHeader]);

  const [showData, setShowData] = useState(false);

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
      sourceName: source !== '' ? source : null,
      rangeExplanation,
      returnRange: subsheetName && subsheetName !== '0' ? formattedRange : '',
    };
  }, [parent]);

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

  const { loading, result, error } = useLiveConnectionCore({
    element: getDefined(parent?.[0]),
    deleted: false,
  });

  const meta = [];

  if (returnRange) {
    meta.push({ label: 'Cells', value: returnRange });
  }

  if (url) {
    meta.push({ label: 'URL', value: url });
  }

  if (loading) {
    meta.push({ label: 'Status', value: loading ? 'Loading' : 'Loaded' });
  }
  const prettySourceName: string = sourceName
    ? ImportElementSourcePretty[sourceName]
    : 'Live';
  return (
    <div {...attributes} css={captionWrapperStyles}>
      <UIIntegrationBlock
        result={result}
        error={error?.message}
        children={children}
        text={prettySourceName}
        type={loading ? 'pending' : 'table'}
        buttons={[
          {
            children: showData ? <Hide /> : <Show />,
            onClick: () => {
              setShowData(!showData);
              removeFocusFromAllBecauseSlate();
            },
            tooltip: `${showData ? 'Hide' : 'Show'} table`,
          },
        ]}
        meta={meta}
        integrationChildren={undefined}
        displayResults={showData}
        firstTableRowControls={
          <ImportTableFirstRowControls
            isFirstRow={!isFirstRowHeaderRow}
            toggleFirstRowIsHeader={toggleFirstRowIsHeader}
          />
        }
      />

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
};
