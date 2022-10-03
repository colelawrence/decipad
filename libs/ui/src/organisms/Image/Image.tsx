import {
  Box,
  Caption,
  ElementPopover,
  Image as PlateImage,
  Media,
  mediaFloatingOptions,
  Resizable,
} from '@udecode/plate';
import { ComponentProps, FC, ReactNode } from 'react';
import { ImageElement, MyElement, PlateComponent } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { useFocused, useSelected } from 'slate-react';
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
  resizableSelectedStyles,
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
}>;

export const Image: ImageComponent = ({
  draggableBlock: Draggable,
  readOnly,
  pluginKey,
  ...props
}) => {
  const { children, element } = props;

  const focused = useFocused();
  const selected = useSelected();
  const isSelected = !readOnly && focused && selected;

  return (
    <ElementPopover
      content={<FloatingMedia pluginKey={pluginKey} />}
      floatingOptions={mediaFloatingOptions}
    >
      <Media.Root {...(props as any)}>
        <Draggable
          blockKind="media"
          element={element as ImageElement}
          draggableCss={draggableStyles}
        >
          <figure css={figureStyles} contentEditable={false}>
            <Resizable
              css={[resizableStyles, isSelected && resizableSelectedStyles]}
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
              minWidth={150}
            >
              <PlateImage css={imgStyles} />
            </Resizable>

            <Caption.Root css={captionStyles} readOnly={readOnly}>
              <Caption.Textarea
                readOnly={readOnly}
                css={captionTextareaStyles}
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
