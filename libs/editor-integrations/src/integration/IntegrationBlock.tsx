import {
  getNodeString,
  insertNodes,
  removeNodes,
  setNodes,
} from '@udecode/plate-common';
import type { ComponentProps } from 'react';
import { Children, useCallback } from 'react';
import { useClientEvents } from '@decipad/client-events';
import {
  DraggableBlock,
  UpgradeWarningBlock,
  insertDataViewBelow,
  insertPlotBelow,
} from '@decipad/editor-components';
import { useComputer, useNodePath } from '@decipad/editor-hooks';
import type {
  MarkType,
  PlateComponent,
  TableColumnFormulaElement,
} from '@decipad/editor-types';
import {
  ELEMENT_INTEGRATION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ImportElementSourcePretty,
  useMyEditorRef,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import {
  useIsEditorReadOnly,
  useNotebookMetaData,
  useResourceUsage,
} from '@decipad/react-contexts';
import { Result, getExprRef } from '@decipad/remote-computer';
import {
  AnimatedIcon,
  CodeResult,
  IntegrationBlock as UIIntegrationBlock,
  icons,
} from '@decipad/ui';
import { assert } from '@decipad/utils';
import { getBlockFormulas, isRectangularTable } from '../utils';
import { ConnectionTable } from './ConnectionTable/ConnectionTable';
import { nanoid } from 'nanoid';

function canBePlotted(result: Result.Result | undefined): boolean {
  return (
    result?.type.kind === 'materialized-column' ||
    result?.type.kind === 'column' ||
    result?.type.kind === 'table' ||
    result?.type.kind === 'materialized-table'
  );
}

export const IntegrationBlock: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  assertElementType(element, ELEMENT_INTEGRATION);

  const [setSidebar] = useNotebookMetaData((s) => [s.setSidebar]);

  const editor = useMyEditorRef();
  const path = useNodePath(element);
  const computer = useComputer();
  const readOnly = useIsEditorReadOnly();

  const onRefresh = () => {
    assert(path != null);

    editor.apply({
      type: 'set_node',
      properties: { timeOfLastRun: element.timeOfLastRun },
      newProperties: { timeOfLastRun: null },
      path,
    });
  };

  const result = computer.getBlockIdResult$.use(element.id)?.result;

  const onAddDataViewButtonPress = useCallback(() => {
    return (
      path &&
      insertDataViewBelow(
        editor,
        path,
        computer,
        element.id,
        getNodeString(element.children[0])
      )
    );
  }, [computer, editor, element, path]);

  const onAddChartViewButtonPress = useCallback(
    (markType: MarkType) => {
      return (
        path && insertPlotBelow(editor, path, markType, getExprRef(element.id))
      );
    },
    [editor, element.id, path]
  );

  const actionButtons: ComponentProps<
    typeof UIIntegrationBlock
  >['actionButtons'] = [
    {
      type: 'button',
      text: 'Edit',
      onClick: () => {
        setSidebar({ type: 'integrations', blockId: element.id });
      },
    },
    ...(!canBePlotted(result)
      ? []
      : [
          {
            type: 'button' as const,
            text: 'Pivot view',
            onClick: onAddDataViewButtonPress,
            icon: <icons.TableSmall />,
          },
          {
            type: 'chart' as const,
            onClick: onAddChartViewButtonPress,
          },
        ]),
  ];

  const track = useClientEvents();
  const { queries } = useResourceUsage();

  const handleClick = async () => {
    if (queries.hasReachedLimit) return;

    onRefresh();

    track({
      segmentEvent: {
        type: 'action',
        action: 'Notebook Integration Query Submitted',
        props: {
          integration_type: element.integrationType.type,
          analytics_source: 'frontend',
        },
      },
    });
  };

  const addFormula = () => {
    if (path == null) {
      return;
    }

    const integrationVarName = getNodeString(element.children[0]);

    const id = nanoid();

    let index = 1;
    let propasedName = 'Column1';

    do {
      propasedName = `Column${index}`;
      index++;
    } while (
      computer.getVarBlockId(`${integrationVarName}.${propasedName}`) != null
    );

    insertNodes(
      editor,
      [
        {
          type: ELEMENT_TABLE_COLUMN_FORMULA,
          children: [{ text: '' }],
          id,
          columnId: id,
          varName: propasedName,
        } satisfies TableColumnFormulaElement,
      ],
      { at: [...path, element.children.length] }
    );
  };

  const renameFormula = (index: number, newName: string) => {
    if (path == null) {
      return;
    }

    setNodes(
      editor,
      { varName: newName } satisfies Partial<TableColumnFormulaElement>,
      { at: [...path, index] }
    );
  };

  const deleteFormula = (index: number) => {
    if (path == null) {
      return;
    }

    removeNodes(editor, { at: [...path, index] });
  };

  const integrationTypeText =
    element.integrationType.type === 'mysql' && element.integrationType.provider
      ? element.integrationType.provider
      : element.integrationType.type;

  const lastRun = element.timeOfLastRun && parseInt(element.timeOfLastRun, 10);
  const lastRunFmt =
    !lastRun || isNaN(lastRun) ? null : new Date(lastRun).toLocaleString();
  const isRectangularResult = isRectangularTable(result);
  const displayResult = result != null && !element.hideResult;

  const [, ...formulaChildren] = element.children;
  const [varName, ...formulas] = Children.toArray(children);

  const columnFormulas = getBlockFormulas(element);

  return (
    <DraggableBlock
      element={element}
      blockKind="editorTable"
      slateAttributes={attributes}
    >
      <UIIntegrationBlock
        formulas={formulaChildren.length > 0 ? formulas : null}
        meta={
          element.timeOfLastRun
            ? [
                {
                  label: 'Last run',
                  value: lastRunFmt ?? element.timeOfLastRun,
                },
              ]
            : []
        }
        text={ImportElementSourcePretty[integrationTypeText]}
        actionButtons={actionButtons}
        buttons={[
          {
            children: (
              <AnimatedIcon icon={<icons.Refresh />} animated={false} />
            ),
            onClick: handleClick,
            tooltip: (
              <UpgradeWarningBlock
                type="queries"
                variant="tooltip"
                fallback="Refresh Data"
                featureText="Unlock Refresh Data"
              />
            ),
            visible: !readOnly,
            disabled: queries.hasReachedLimit,
          },
          {
            children: element.hideResult ? <icons.Show /> : <icons.Hide />,
            onClick: (ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              if (path) {
                setNodes(
                  editor,
                  { hideResult: !element.hideResult },
                  { at: path }
                );
              }
            },
            tooltip: `${element.hideResult ? 'Show' : 'Hide'} table`,
          },
        ]}
        result={result}
        resultPreview={
          !displayResult ? null : isRectangularResult ? (
            <ConnectionTable
              type="static"
              tableResult={result as Result.Result<'table'>}
              hiddenColumns={[]}
              onAddFormula={addFormula}
              formulaColumns={columnFormulas}
              onChangeFormulaName={renameFormula}
              onDeleteFormula={deleteFormula}
              isReadOnly={readOnly}
            />
          ) : (
            <CodeResult {...result!} isLiveResult />
          )
        }
      >
        {varName}
      </UIIntegrationBlock>
    </DraggableBlock>
  );
};
