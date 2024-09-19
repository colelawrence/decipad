/* eslint-disable no-underscore-dangle */
import {
  insertDataViewBelow,
  insertPlotBelow,
} from '@decipad/editor-components';

import { useComputer, useParentNodeEntry } from '@decipad/editor-hooks';
import type { MyEditor, PlateComponent, MarkType } from '@decipad/editor-types';
import {
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
  ImportElementSourcePretty,
  useMyEditorRef,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import type { SourceUrlParseResponse } from '@decipad/import';
import { parseSourceUrl } from '@decipad/import';
import { removeFocusFromAllBecauseSlate } from '@decipad/react-utils';
import { getExprRef } from '@decipad/remote-computer';
import { useToast } from '@decipad/toast';

import {
  CodeResult,
  IntegrationBlock as UIIntegrationBlock,
} from '@decipad/ui';
import { css } from '@emotion/react';
import {
  findNodePath,
  getNodeChild,
  getNodeString,
  isElement,
} from '@udecode/plate-common';
import { Hide, Show, TableSmall } from 'libs/ui/src/icons';
import type { ComponentProps } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useLiveConnectionResult } from '../contexts/LiveConnectionResultContext';

const captionWrapperStyles = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '8px',
});

type IntegrationButtons = Pick<
  ComponentProps<typeof UIIntegrationBlock>,
  'actionButtons'
>;

export const LiveConnectionVarName: PlateComponent = (props) => {
  assertElementType(props.element, ELEMENT_LIVE_CONNECTION_VARIABLE_NAME);
  const parentEntry = useParentNodeEntry(props.element);
  const parentElem = parentEntry?.[0];

  if (
    !parentElem ||
    !isElement(parentElem) ||
    parentElem.type !== ELEMENT_LIVE_CONNECTION
  ) {
    return <></>;
  }

  return <RealLiveConnectionVarName {...props} />;
};

export const RealLiveConnectionVarName: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  assertElementType(element, ELEMENT_LIVE_CONNECTION_VARIABLE_NAME);
  const editor: MyEditor = useMyEditorRef();
  const path = findNodePath(editor, element);
  const parentEntry = useParentNodeEntry(element);
  const parentElem = parentEntry?.[0];
  const parentPath = parentEntry?.[1];
  if (parentElem) {
    assertElementType(parentElem, ELEMENT_LIVE_CONNECTION);
  }

  const [showData, setShowData] = useState(false);

  const toast = useToast();

  const { sourceName, url, returnRange } = useMemo(() => {
    const source = parentElem?.source ?? '';
    const parentUrl = parentElem?.url;

    let sourceParams: SourceUrlParseResponse | undefined;
    try {
      sourceParams =
        (source &&
          parentUrl != null &&
          !parentElem?.externalDataSourceId &&
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
    parentElem?.externalDataSourceId,
    parentElem?.source,
    parentElem?.url,
    toast,
  ]);

  const computer = useComputer();

  const onAddDataViewButtonPress = useCallback(() => {
    if (!parentElem || !parentPath) {
      return;
    }

    return (
      path &&
      insertDataViewBelow(
        editor,
        parentPath,
        computer,
        parentElem.id,
        getNodeString(getNodeChild(element, 0))
      )
    );
  }, [computer, editor, element, parentElem, parentPath, path]);

  const onAddChartViewButtonPress = useCallback(
    (markType: MarkType) => {
      if (!parentElem || !parentPath) {
        return;
      }

      return (
        path &&
        insertPlotBelow(
          editor,
          parentPath,
          markType,
          getExprRef(parentElem.id ?? '')
        )
      );
    },
    [editor, parentElem, parentPath, path]
  );

  const {
    result: { loading, result },
    error,
  } = useLiveConnectionResult();

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
            icon: <TableSmall />,
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
        resultPreview={
          result == null ? null : <CodeResult {...result} isLiveResult />
        }
      />
    </div>
  );
};
