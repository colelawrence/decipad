import {
  insertDataViewBelow,
  insertPlotBelow,
} from '@decipad/editor-components';

import { usePathMutatorCallback } from '@decipad/editor-hooks';
import {
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
  ImportElementSourcePretty,
  LiveConnectionElement,
  MyEditor,
  PlateComponent,
  useMyEditorRef,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { SourceUrlParseResponse, parseSourceUrl } from '@decipad/import';
import { removeFocusFromAllBecauseSlate } from '@decipad/react-utils';
import { getExprRef } from '@decipad/remote-computer';
import { useToast } from '@decipad/toast';
import {
  ImportTableFirstRowControls,
  MarkType,
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
} from '@udecode/plate-common';
import { Hide, Show } from 'libs/ui/src/icons';
import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { Path } from 'slate';
import { useLiveConnectionResult } from '../contexts/LiveConnectionResultContext';
import { useCoreLiveConnectionActions } from '../hooks/useCoreLiveConnectionActions';
import { useComputer } from '@decipad/react-contexts';

const captionWrapperStyles = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '8px',
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
  const editor: MyEditor = useMyEditorRef();
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

  const toast = useToast();

  const { sourceName, url, returnRange } = useMemo(() => {
    const source = parentElem.source ?? '';
    const parentUrl = parentElem.url;

    let sourceParams: SourceUrlParseResponse | undefined;
    try {
      sourceParams =
        (source &&
          parentUrl != null &&
          !parentElem.externalDataSourceId &&
          parseSourceUrl(source, parentUrl)) ||
        (parentUrl != null && { userUrl: parentUrl }) ||
        undefined;
    } catch (err) {
      toast.error((err as Error).message);
      return {};
    }

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
  }, [
    parentElem.externalDataSourceId,
    parentElem.source,
    parentElem.url,
    toast,
  ]);

  const computer = useComputer();

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
        computer,
        tableElement.id,
        getNodeString(getNodeChild(element, 0))
      )
    );
  }, [computer, editor, element, parent, parentPath, path]);

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
    </div>
  );
};
