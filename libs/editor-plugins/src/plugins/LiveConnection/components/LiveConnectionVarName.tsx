import { insertLiveQueryBelow } from '@decipad/editor-components';

import { usePathMutatorCallback } from '@decipad/editor-hooks';
import {
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
  ImportElementSourcePretty,
  LiveConnectionElement,
  MyEditor,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, isDatabaseConnection } from '@decipad/editor-utils';
import { isFlagEnabled } from '@decipad/feature-flags';
import { SourceUrlParseResponse, parseSourceUrl } from '@decipad/import';
import { useComputer } from '@decipad/react-contexts';
import { removeFocusFromAllBecauseSlate } from '@decipad/react-utils';
import {
  ImportTableFirstRowControls,
  TableButton,
  IntegrationBlock as UIIntegrationBlock,
} from '@decipad/ui';
import { getDefined } from '@decipad/utils';
import { css } from '@emotion/react';
import { TNodeEntry, findNodePath, getParentNode } from '@udecode/plate';
import { Hide, Show } from 'libs/ui/src/icons';
import { useCallback, useMemo, useState } from 'react';
import { Path } from 'slate';
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
  const editor: MyEditor = useTEditorRef();
  const path = findNodePath(editor, element);
  const parent: TNodeEntry<LiveConnectionElement> | undefined =
    path && getParentNode(editor, path);
  const parentElem = parent?.[0] as LiveConnectionElement;
  const parentPath = parent?.[1] as Path;
  if (!parentElem || !parentPath) {
    throw new Error('Issue with finding parent. Contact support.');
  }
  if (parent) {
    assertElementType(parentElem, ELEMENT_LIVE_CONNECTION);
  }
  const setIsFirstRowHeader = usePathMutatorCallback<
    LiveConnectionElement,
    'isFirstRowHeaderRow'
  >(editor, parentPath, 'isFirstRowHeaderRow', 'LiveConnectionVarName');

  const isFirstRowHeaderRow = parent?.[0].isFirstRowHeaderRow;

  const toggleFirstRowIsHeader = useCallback(() => {
    setIsFirstRowHeader(!isFirstRowHeaderRow);
  }, [isFirstRowHeaderRow, setIsFirstRowHeader]);

  const [showData, setShowData] = useState(false);

  const { sourceName, url, returnRange } = useMemo(() => {
    const source = parentElem.source ?? '';
    const parentUrl = parentElem.url;

    const sourceParams: SourceUrlParseResponse | undefined =
      (source &&
        parentUrl != null &&
        !parentElem.externalDataSourceId &&
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
  }, [parentElem.externalDataSourceId, parentElem.source, parentElem.url]);

  const computer = useComputer();

  const onCreateQueryPress = useCallback(() => {
    if (parent) {
      insertLiveQueryBelow(
        editor,
        parentPath,
        computer.getAvailableIdentifier.bind(computer),
        parentElem.id
      );
    }
  }, [computer, editor, parent, parentElem.id, parentPath]);

  const { loading, result, error } = useLiveConnectionCore({
    element: getDefined(parentElem),
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
        isDatabaseConnection(parentElem) && (
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
