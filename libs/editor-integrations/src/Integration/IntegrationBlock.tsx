import { DraggableBlock } from '@decipad/editor-components';
import { useNodePath } from '@decipad/editor-hooks';
import {
  ELEMENT_INTEGRATION,
  ImportElementSourcePretty,
  IntegrationTypes,
  MyElement,
  PlateComponent,
  SimpleTableCellType,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, isStructuredElement } from '@decipad/editor-utils';
import { useComputer, useIsEditorReadOnly } from '@decipad/react-contexts';
import { removeFocusFromAllBecauseSlate } from '@decipad/react-utils';
import {
  AnimatedIcon,
  IntegrationBlock as UIIntegrationBlock,
} from '@decipad/ui';
import { getPreviousNode, setNodes } from '@udecode/plate';
import { Hide, Refresh, Show } from 'libs/ui/src/icons';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Subject } from 'rxjs';
import { CodeIntegration } from './CodeIntegration';

function getIntegrationComponent(
  id: string,
  varName: string,
  typeMappings: IntegrationTypes.IntegrationBlock['typeMappings'],
  blockOptions: IntegrationTypes.IntegrationBlock['integrationType']
): ReactNode {
  switch (blockOptions.type) {
    case 'codeconnection':
      return (
        <CodeIntegration
          id={id}
          varName={varName}
          typeMappings={typeMappings}
          blockOptions={blockOptions}
        />
      );
    default:
      return null;
  }
}

type ContextActions = 'refresh' | 'show-source';
const IntegrationBlockContext = createContext<
  Subject<ContextActions> | undefined
>(undefined);

export const useIntegrationContext = () => useContext(IntegrationBlockContext);

export const IntegrationBlock: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  assertElementType(element, ELEMENT_INTEGRATION);

  const observable = useRef(new Subject<ContextActions>());
  const [animated, setAnimated] = useState(false);

  const editor = useTEditorRef();
  const path = useNodePath(element);
  const prevElement = getPreviousNode<MyElement>(editor, { at: path });

  const specificIntegration = useMemo(
    () =>
      getIntegrationComponent(
        element.id,
        element.children[0].text,
        element.typeMappings,
        element.integrationType
      ),
    [
      element.children,
      element.id,
      element.integrationType,
      element.typeMappings,
    ]
  );

  const computer = useComputer();
  const blockResult = computer.getBlockIdResult$.use(element.id);

  const readOnly = useIsEditorReadOnly();

  const { timeOfLastRun } = element.integrationType;

  const [showData, setShowData] = useState(false);

  const resultType = blockResult?.result?.type;
  // @ts-ignore - it does exist
  const err = resultType?.errorCause;

  const errCause =
    err?.errType === 'duplicated-name'
      ? 'Variable name is duplicated. Change it.'
      : 'An error has occured';

  const blockType = useMemo(
    () => blockResult?.result?.type.kind,
    [blockResult?.result?.type.kind]
  );

  const liveText = useMemo(
    () => ImportElementSourcePretty[element.integrationType.type],
    [element.integrationType.type]
  );

  const onChangeColumnType = useCallback(
    (columnIndex: number, colType?: SimpleTableCellType) => {
      const typeMappings = element.typeMappings.slice(0);
      typeMappings[columnIndex] = colType;
      setNodes(
        editor,
        {
          typeMappings,
        },
        { at: path }
      );
    },
    [editor, element.typeMappings, path]
  );

  return (
    <IntegrationBlockContext.Provider value={observable.current}>
      <DraggableBlock
        {...attributes}
        element={element}
        blockKind="live"
        hasPreviousSibling={isStructuredElement(prevElement?.[0])}
      >
        <UIIntegrationBlock
          meta={
            timeOfLastRun ? [{ label: 'Last run', value: timeOfLastRun }] : []
          }
          error={err && new Error(errCause)}
          type={blockType}
          text={liveText}
          children={children} // text input
          onChangeColumnType={onChangeColumnType}
          integrationChildren={specificIntegration}
          actionButton={{
            text: 'View source',
            onClick: () => {
              observable.current.next('show-source');
              removeFocusFromAllBecauseSlate();
            },
          }}
          buttons={[
            {
              children: <AnimatedIcon icon={<Refresh />} animated={animated} />,
              onClick: () => {
                setAnimated(true);
                setTimeout(() => {
                  setAnimated(false);
                }, 1000);
                observable.current.next('refresh');
                removeFocusFromAllBecauseSlate();
              },
              tooltip: 'Refresh data',
              visible: !readOnly,
            },
            {
              children: showData ? <Hide /> : <Show />,
              onClick: () => {
                setShowData(!showData);
                removeFocusFromAllBecauseSlate();
              },
              tooltip: `${showData ? 'Hide' : 'Show'} table`,
            },
          ]}
          displayResults={showData}
          result={blockResult?.result}
        />
      </DraggableBlock>
    </IntegrationBlockContext.Provider>
  );
};
