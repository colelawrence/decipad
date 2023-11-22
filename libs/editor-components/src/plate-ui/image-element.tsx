import {
  ImageElement as ImageElementType,
  MyElement,
  PlateComponent,
} from '@decipad/editor-types';
import { css } from '@emotion/react';
import { PlateElement } from '@udecode/plate-common';
import { ComponentProps, FC, ReactNode } from 'react';
import {
  cn,
  componentCssVars,
  cssVar,
  DraggableBlock,
  p14Regular,
} from '@decipad/ui';
import { MediaPopover } from './media-popover';
import {
  ELEMENT_IMAGE,
  Image as ImagePrimitive,
  useMediaState,
} from '@udecode/plate-media';
import { useResizableStore } from '@udecode/plate-resizable';
import {
  mediaResizeHandleVariants,
  Resizable,
  ResizeHandle,
} from './resizable';
import { Caption, CaptionTextarea } from './caption';

export const draggableStyles = css({
  paddingTop: 8,
});

const imagePlaceholderStyles = css({
  background: `
  radial-gradient(
    ellipse at center,
    ${cssVar('backgroundSubdued')} 0%,
    transparent 100%
  ),
  linear-gradient(
    180deg, ${cssVar('backgroundDefault')} 30.41%, ${cssVar(
    'backgroundHeavy'
  )} 100%
  )
`,
});

const resizableImagePlaceholderStyles = css({
  background: `no-repeat center ${componentCssVars(
    'TableSelectionBackgroundColor'
  )}`,
});

type ImageComponent = PlateComponent<{
  draggableBlock: FC<
    ComponentProps<typeof DraggableBlock> & {
      readonly element: MyElement;
      readonly children: ReactNode;
    }
  >;
  readOnly?: boolean;
  accept?: any;
  getAxis?: any;
  onDrop?: any;
}>;

export const ImageElement: ImageComponent = ({
  draggableBlock: Draggable,
  readOnly,
  accept,
  getAxis,
  onDrop,
  className,
  ...props
}) => {
  const { children, element } = props;

  const { focused, selected, align = 'center' } = useMediaState();
  const width = useResizableStore().get.width();
  const isSelected = !readOnly && focused && selected;

  return (
    <MediaPopover pluginKey={ELEMENT_IMAGE}>
      <PlateElement className={cn('py-2.5', className)} {...(props as any)}>
        <Draggable
          blockKind="media"
          element={element as ImageElementType}
          draggableCss={draggableStyles}
          accept={accept}
          getAxis={getAxis}
          onDrop={onDrop}
        >
          <figure
            className="block-figure group relative m-0"
            aria-roledescription="column-content"
            contentEditable={false}
            data-testid="notebook-image-block"
          >
            <Resizable
              css={[
                imagePlaceholderStyles,
                isSelected && resizableImagePlaceholderStyles,
              ]}
              align={align}
              options={{
                align,
                readOnly,
                minWidth: 200,
              }}
            >
              <ResizeHandle
                options={{ direction: 'left' }}
                className={mediaResizeHandleVariants({ direction: 'left' })}
              />

              <ImagePrimitive
                className={cn(
                  'block w-full max-w-full cursor-pointer object-cover px-0 rounded-sm'
                )}
                onError={(e) => {
                  const event = e as unknown as {
                    target: { style: { display: string } };
                  };
                  // eslint-disable-next-line no-param-reassign
                  event.target.style.display = 'none';
                }}
              />

              <ResizeHandle
                options={{ direction: 'right' }}
                className={mediaResizeHandleVariants({ direction: 'right' })}
              />
            </Resizable>

            <Caption readOnly={readOnly} align={align} style={{ width }}>
              <CaptionTextarea
                readOnly={readOnly}
                placeholder="Description of your image..."
                css={[p14Regular]}
              />
            </Caption>
          </figure>

          {children}
        </Draggable>
      </PlateElement>
    </MediaPopover>
  );
};
