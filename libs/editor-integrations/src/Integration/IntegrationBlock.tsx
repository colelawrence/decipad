import { DraggableBlock } from '@decipad/editor-components';
import { useNodePath } from '@decipad/editor-hooks';
import {
  ELEMENT_INTEGRATION,
  ImportElementSourcePretty,
  IntegrationTypes,
  MyElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, isStructuredElement } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { removeFocusFromAllBecauseSlate } from '@decipad/react-utils';
import {
  AnimatedIcon,
  CodeResult,
  LiveCode,
  cssVar,
  p12Medium,
} from '@decipad/ui';
import { css } from '@emotion/react';
import { getPreviousNode } from '@udecode/plate';
import { Hide, Refresh, Show } from 'libs/ui/src/icons';
import { integrationBlockStyles } from 'libs/ui/src/styles/editor-layout';
import {
  ReactNode,
  createContext,
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

  const [showData, setShowData] = useState(false);

  const resultType = blockResult?.result?.type;
  // @ts-ignore - it does exist
  const err = resultType?.errorCause;

  const errCause =
    err?.errType === 'duplicated-name'
      ? 'Variable name is duplicated. Change it.'
      : 'An error has occured';

  return (
    <IntegrationBlockContext.Provider value={observable.current}>
      <DraggableBlock
        {...attributes}
        element={element}
        blockKind="live"
        hasPreviousSibling={isStructuredElement(prevElement?.[0])}
      >
        <div css={integrationBlockStyles}>
          <div css={css({ display: 'flex', alignItems: 'center' })}>
            <LiveCode
              error={err && new Error(errCause)}
              text={ImportElementSourcePretty[element.integrationType.type]}
            >
              {children}
            </LiveCode>
            <div contentEditable={false}>{specificIntegration}</div>

            <div contentEditable={false} css={controlStyles}>
              <div
                onClick={() => {
                  observable.current.next('show-source');
                  removeFocusFromAllBecauseSlate();
                }}
              >
                <span>View source</span>
              </div>
              <div css={controlIconStyles}>
                <figure
                  role="button"
                  onClick={() => {
                    setAnimated(true);
                    setTimeout(() => {
                      setAnimated(false);
                    }, 1000);
                    observable.current.next('refresh');
                    removeFocusFromAllBecauseSlate();
                  }}
                >
                  <AnimatedIcon icon={<Refresh />} animated={animated} />
                </figure>
                <figure
                  role="button"
                  onClick={() => {
                    setShowData(!showData);
                    removeFocusFromAllBecauseSlate();
                  }}
                >
                  {showData ? <Hide /> : <Show />}
                </figure>
              </div>
            </div>
          </div>

          <div contentEditable={false} css={codeResultStyles}>
            {showData && blockResult?.result && (
              <CodeResult
                value={blockResult?.result?.value}
                type={blockResult?.result?.type}
              />
            )}
          </div>
        </div>
      </DraggableBlock>
    </IntegrationBlockContext.Provider>
  );
};

const codeResultStyles = css({
  display: 'flex',
});

const controlStyles = css(p12Medium, {
  // Shifts whole div to the right.
  marginLeft: 'auto',
  display: 'flex',
  cursor: 'pointer',
  gap: '4px',
  color: cssVar('normalTextColor'),
  '& div': {
    borderRadius: '6px',
    outline: `1px solid ${cssVar('borderHighlightColor')}`,
    backgroundColor: cssVar('highlightColor'),
  },
  '& div:first-of-type': {
    padding: '4px 8px',
  },
});

const controlIconStyles = css({
  display: 'flex',
  '& figure:last-of-type': {
    borderLeft: `1px solid ${cssVar('borderHighlightColor')}`,
  },
  '& svg': {
    margin: '4px',
    width: '16px',
    height: '16px',
  },
});
