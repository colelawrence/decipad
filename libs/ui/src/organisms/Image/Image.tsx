import { ImageElement, MyElement, PlateComponent } from '@decipad/editor-types';
import { css } from '@emotion/react';
import {
  Box,
  Caption,
  ElementPopover,
  Media,
  Image as PlateImage,
  Resizable,
  mediaFloatingOptions,
} from '@udecode/plate';
import { ComponentProps, FC, ReactNode } from 'react';
import { useFocused, useSelected } from 'slate-react';
import { cssVar } from '../../primitives';
import { Div, FigCaption } from '../../utils/resizing';
import { DraggableBlock } from '../DraggableBlock/DraggableBlock';
import { FloatingMedia } from '../FloatingMedia/FloatingMedia';
import {
  captionStyles,
  captionTextareaStyles,
  draggableStyles,
  figureStyles,
  handleLeftStyles,
  handleRightStyles,
  handleSelectedStyles,
  resizableStyles,
} from '../MediaEmbed/styles';

export const imgStyles = css({
  display: 'block',
  paddingLeft: '0',
  paddingRight: '0',
  width: '100%',
  maxWidth: '100%',
  cursor: 'pointer',
  objectFit: 'cover',
  borderRadius: 8,
  border: 0,
});

const imagePlaceholderStyles = css({
  background: `
  radial-gradient(
    ellipse at center,
    ${cssVar('tintedBackgroundColor')} 0%,
    transparent 100%
  ),
  linear-gradient(
    180deg, ${cssVar('highlightColor')} 30.41%, ${cssVar(
    'tintedBackgroundColor'
  )} 100%
  )
`,
});

const resizableImagePlaceholderStyles = css({
  background: `no-repeat center ${cssVar('tableSelectionBackgroundColor')}`,
});

type ImageComponent = PlateComponent<{
  draggableBlock: FC<
    ComponentProps<typeof DraggableBlock> & {
      readonly element: MyElement;
      readonly children: ReactNode;
    }
  >;
  pluginKey?: string;
  readOnly?: boolean;
  accept?: any;
  getAxis?: any;
  onDrop?: any;
}>;

export const Image: ImageComponent = ({
  draggableBlock: Draggable,
  readOnly,
  pluginKey,
  accept,
  getAxis,
  onDrop,
  ...props
}) => {
  const { children, element } = props;

  const focused = useFocused();
  const selected = useSelected();
  const isSelected = !readOnly && focused && selected;

  return (
    <ElementPopover
      content={!readOnly && <FloatingMedia pluginKey={pluginKey} />}
      floatingOptions={mediaFloatingOptions}
    >
      <Media.Root {...(props as any)}>
        <Draggable
          blockKind="media"
          element={element as ImageElement}
          draggableCss={draggableStyles}
          accept={accept}
          getAxis={getAxis}
          onDrop={onDrop}
        >
          <figure
            aria-label="column-content"
            css={figureStyles}
            contentEditable={false}
          >
            <Resizable
              css={[
                resizableStyles,
                imagePlaceholderStyles,
                isSelected && resizableImagePlaceholderStyles,
              ]}
              handleComponent={{
                left: (
                  <Box
                    css={[handleLeftStyles, isSelected && handleSelectedStyles]}
                  />
                ),
                right: (
                  <Box
                    css={[
                      handleRightStyles,
                      isSelected && handleSelectedStyles,
                    ]}
                  />
                ),
              }}
              readOnly={readOnly}
              minWidth={200}
              minHeight={200}
              as={Div}
            >
              <PlateImage
                css={imgStyles}
                onError={(event: {
                  target: { style: { display: string } };
                }) => {
                  // eslint-disable-next-line no-param-reassign
                  event.target.style.display = 'none';
                }}
              />
            </Resizable>

            <Caption.Root
              css={captionStyles}
              readOnly={readOnly}
              as={FigCaption}
            >
              <Caption.Textarea
                readOnly={readOnly}
                css={[captionTextareaStyles]}
                placeholder="Description of your image..."
              />
            </Caption.Root>
          </figure>

          {children}
        </Draggable>
      </Media.Root>
    </ElementPopover>
  );
};
