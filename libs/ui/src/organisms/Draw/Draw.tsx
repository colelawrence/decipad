/* eslint decipad/css-prop-named-variable: 0 */
import {
  DrawElement,
  DrawElementDescendant,
  DrawElements,
  MyEditor,
  MyElement,
  PlateComponent,
} from '@decipad/editor-types';
import { useThemeFromStore } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { THEME } from '@excalidraw/excalidraw';
import {
  ExcalidrawDataState,
  ExcalidrawElement,
  ExcalidrawElementProps,
} from '@udecode/plate-ui-excalidraw';
import {
  ComponentProps,
  FC,
  MouseEvent,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import { blue200, blue300, cssVar } from '../../primitives';
import { DraggableBlock } from '../DraggableBlock/DraggableBlock';

const drawStyles = css({
  display: 'block',
  width: '100%',
  maxWidth: '100%',
  cursor: 'pointer',
  borderRadius: 8,
  border: 0,
});

type ExcalidrawProps = NonNullable<
  ExcalidrawElementProps<DrawElementDescendant[]>['excalidrawProps']
>;
type ExcalidrawRef = NonNullable<ExcalidrawProps['excalidrawRef']>;
type AppState = NonNullable<ExcalidrawDataState['appState']>;
type ExcalidrawDrawElement = Omit<DrawElementDescendant, 'children'>;

interface DrawComponentProps {
  excalidrawRef: ExcalidrawRef;
  draggableBlock: FC<
    ComponentProps<typeof DraggableBlock> & {
      readonly element: MyElement;
      readonly children: ReactNode;
    }
  >;
  readOnly?: boolean;
  elements: DrawElements;
  onChange?: (elements: Readonly<ExcalidrawDrawElement[]>) => void;
  onInteractingChange: (interacting: boolean) => void;
  editor: MyEditor;
}

type DrawComponent = PlateComponent<DrawComponentProps>;

const excalidrawContainerStyles = css({
  '& > div > div': {
    height: '400px',
  },
  '.excalidraw': {
    '--color-primary': blue300.rgb,
    '--icon-fill-color': cssVar('textDefault'),
    '--button-gray-1': cssVar('backgroundDefault'),
    '--button-gray-2': blue200.rgb,
    '--theme-filter': 'none',
  },
  '.excalidraw.theme--dark': {
    '--theme-filter': 'invert(1) hue-rotate(180deg)',
    canvas: {
      mixBlendMode: 'screen',
    },
  },
});

const excalidrawReadOnlyStyles = css({
  '.excalidraw': {
    pointerEvents: 'none',
  },
});

const inferInteracting = (appState: AppState): boolean => {
  return (
    !!appState.draggingElement ||
    !!appState.editingElement ||
    !!appState.editingLinearElement ||
    !!appState.resizingElement
  );
};

const ExcalidrawElementWithRef: FC<
  ComponentProps<typeof ExcalidrawElement> & {
    excalidrawProps?: { ref?: ExcalidrawRef };
  }
> = ExcalidrawElement;

export const Draw: DrawComponent = ({
  draggableBlock: Draggable,
  excalidrawRef,
  readOnly,
  elements,
  onChange = noop,
  onInteractingChange = noop,
  ...props
}) => {
  const { attributes, children, element } = props;
  const appState = useRef<unknown>({});

  const onExcalidrawChange = useCallback(
    (newElements: Readonly<ExcalidrawDrawElement[]>, newAppState: AppState) => {
      appState.current = newAppState;
      onChange(newElements);
      onInteractingChange(inferInteracting(newAppState));
    },
    [onChange, onInteractingChange]
  );

  const [darkTheme] = useThemeFromStore();

  const stopClickPropagation = useCallback((event: MouseEvent) => {
    event.stopPropagation();
  }, []);

  // ExcalidrawProps for all the configuration options
  return (
    <Draggable
      blockKind="draw"
      element={element as DrawElement}
      draggableCss={drawStyles}
      {...attributes}
    >
      <div className={'block-figure'} onClick={stopClickPropagation}>
        <ExcalidrawElementWithRef
          css={[
            excalidrawContainerStyles,
            readOnly && excalidrawReadOnlyStyles,
          ]}
          excalidrawProps={{
            ref: excalidrawRef,
            onChange: readOnly ? noop : onExcalidrawChange,
            gridModeEnabled: !readOnly,
            zenModeEnabled: true,
            viewModeEnabled: readOnly,
            initialData: { elements, appState: appState.current },
            theme: darkTheme ? THEME.DARK : THEME.LIGHT,
            UIOptions: {
              canvasActions: {
                export: false,
                clearCanvas: false,
                loadScene: false,
                saveToActiveFile: false,
                saveAsImage: false,
                changeViewBackgroundColor: false,
                theme: !darkTheme,
              },
            },
          }}
          {...(props as any)}
        />
      </div>
      {children}
    </Draggable>
  );
};
