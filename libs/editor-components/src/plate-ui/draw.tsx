import {
  ELEMENT_DRAW,
  type DrawElementDescendant,
  type DrawElements,
  type MyEditor,
  type PlateComponent,
} from '@decipad/editor-types';
import { useThemeFromStore } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { THEME } from '@excalidraw/excalidraw';
import type { ExcalidrawDataState } from '@udecode/plate-excalidraw';
import type { FC, MouseEvent } from 'react';
import { useCallback, useRef } from 'react';
import { blue200, blue300, cssVar } from '@decipad/ui';
import type { ExcalidrawProps, ExcalidrawRef } from './excalidraw-element';
import { ExcalidrawElement } from './excalidraw-element';
import { DraggableBlock } from '../block-management';
import { assertElementType } from '@decipad/editor-utils';

type AppState = NonNullable<ExcalidrawDataState['appState']>;
type ExcalidrawDrawElement = Omit<DrawElementDescendant, 'children'>;

interface DrawComponentProps {
  excalidrawRef: ExcalidrawRef;
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
  ExcalidrawProps & {
    excalidrawProps?: { ref?: ExcalidrawRef };
  }
> = ExcalidrawElement;

export const Draw: DrawComponent = ({
  excalidrawRef,
  readOnly,
  elements,
  onChange = noop,
  onInteractingChange = noop,
  ...props
}) => {
  const { attributes, children, element } = props;
  const appState = useRef<unknown>({});

  assertElementType(element, ELEMENT_DRAW);

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
    <DraggableBlock
      blockKind="draw"
      element={element}
      slateAttributes={attributes}
    >
      <div
        className="block-figure [&_.App-toolbar-content>button:first-child]:!hidden"
        onClick={stopClickPropagation}
      >
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
    </DraggableBlock>
  );
};
