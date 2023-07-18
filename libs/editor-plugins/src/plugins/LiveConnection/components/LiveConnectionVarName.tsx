import {
  insertDataViewBelow,
  insertLiveQueryBelow,
  insertPlotBelow,
} from '@decipad/editor-components';

import { getExprRef } from '@decipad/computer';
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
  icons,
} from '@decipad/ui';
import { css } from '@emotion/react';
import {
  TNodeEntry,
  findNodePath,
  getNodeChild,
  getNodeString,
  getParentNode,
} from '@udecode/plate';
import { Hide, Show } from 'libs/ui/src/icons';
import { MarkType } from 'libs/ui/src/organisms/PlotParams/PlotParams';
import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { Path } from 'slate';
import { useLiveConnectionResult } from '../contexts/LiveConnectionResultContext';
import { useCoreLiveConnectionActions } from '../hooks/useCoreLiveConnectionActions';

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

type IntegrationButtons = Pick<
  ComponentProps<typeof UIIntegrationBlock>,
  'actionButtons'
>;

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

  const onAddDataViewButtonPress = useCallback(() => {
    if (!parent) {
      return;
    }

    const [tableElement] = parent;

    return (
      path &&
      insertDataViewBelow(
        editor,
        parentPath,
        tableElement.id,
        getNodeString(getNodeChild(element, 0))
      )
    );
  }, [editor, element, parent, parentPath, path]);

  const onAddChartViewButtonPress = useCallback(
    (markType: MarkType) => {
      if (!parent) {
        return;
      }

      const [tableElement] = parent;

      return (
        path &&
        insertPlotBelow(
          editor,
          parentPath,
          markType,
          getExprRef(tableElement.id)
        )
      );
    },
    [editor, parent, parentPath, path]
  );

  const {
    result: { loading, result },
    error,
  } = useLiveConnectionResult();

  const { onChangeColumnType } = useCoreLiveConnectionActions({
    path: parentPath,
    element: parentElem,
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

  const canBePlotted =
    result?.type.kind === 'materialized-column' ||
    result?.type.kind === 'column' ||
    result?.type.kind === 'table' ||
    result?.type.kind === 'materialized-table';

  const { actionButtons }: IntegrationButtons = {
    actionButtons: canBePlotted
      ? [
          {
            type: 'button',
            text: 'Pivot view',
            onClick: onAddDataViewButtonPress,
            icon: <icons.TableRows />,
          },
          {
            type: 'chart',
            onClick: onAddChartViewButtonPress,
          },
        ]
      : [],
  };
  return (
    <div {...attributes} css={captionWrapperStyles}>
      <UIIntegrationBlock
        result={result}
        error={error?.message}
        children={children}
        text={prettySourceName}
        type={loading ? 'pending' : 'table'}
        actionButtons={actionButtons}
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
        onChangeColumnType={onChangeColumnType}
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
