import { Box, Image as PlateImage, ImageProps } from '@udecode/plate';
import { ComponentProps, FC, ReactNode } from 'react';
import { ImageElement, MyElement, PlateComponent } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { useFocused, useSelected } from 'slate-react';
import { grey200 } from '../../primitives/index';
import { DraggableBlock } from '../DraggableBlock/DraggableBlock';

const rootStyles = css({
  padding: '10px 10px',
});

const resizableStyles = css({
  margin: '0 auto',
  height: 'auto !important',
  padding: 8,
  borderRadius: 8,
});

const resizableSelectedStyles = css({
  background: grey200.rgb,
});

const figureStyles = css({
  margin: 0,
  position: 'relative',
});

const imgStyles = css({
  display: 'block',
  paddingLeft: '0',
  paddingRight: '0',
  width: '100%',
  maxWidth: '100%',
  cursor: 'pointer',
  objectFit: 'cover',
  borderRadius: 8,
});

const captionStyles = css({
  margin: '0 auto',
  cursor: 'text',
});

const captionTextareaStyles = css({
  padding: '0',
  marginTop: 8,
  width: '100%',
  borderStyle: 'none',
  resize: 'none',
  font: 'inherit',
  color: 'inherit',
  backgroundColor: 'inherit',
  textAlign: 'center',
  ':focus': { '::placeholder': { opacity: 0 } },
});

const handleStyles = css({
  display: 'flex',
  position: 'absolute',
  top: '0',
  zIndex: 10,
  flexDirection: 'column',
  justifyContent: 'center',
  width: '1.5rem',
  height: '100%',
  userSelect: 'none',

  '::after': {
    display: 'flex',
    opacity: 0,
    content: "' '",
    width: '3px',
    height: '64px',
    borderRadius: '6px',

    // Handle color:
    // backgroundColor: grey100.rgb,
  },

  // Handle color:
  // ':hover,:focus,:active': { '::after': { background: brand500.rgb } },
});

const handleSelectedStyles = css({
  '::after': {
    opacity: 1,
  },
});

const handleLeftStyles = css([
  handleStyles,
  {
    left: -12,
    paddingLeft: 12,
    marginLeft: -12,
  },
]);

const handleRightStyles = css([
  handleStyles,
  {
    right: -12,
    paddingRight: 12,
    marginRight: -12,
    alignItems: 'flex-end',
  },
]);

const draggableStyles = css({
  paddingTop: 8,
});

type ImageComponent = PlateComponent<{
  draggableBlock: FC<
    ComponentProps<typeof DraggableBlock> & {
      readonly element: MyElement;
      readonly children: ReactNode;
    }
  >;
  readOnly?: boolean;
}>;

export const Image: ImageComponent = ({
  draggableBlock: Draggable,
  readOnly,
  ..._props
}) => {
  const props = _props as unknown as ImageProps;
  const { children, element } = props;

  const focused = useFocused();
  const selected = useSelected();
  const isSelected = !readOnly && focused && selected;

  return (
    <PlateImage.Root css={rootStyles} {...props}>
      <Draggable
        blockKind="image"
        element={element as ImageElement}
        draggableCss={draggableStyles}
      >
        <figure css={figureStyles} contentEditable={false}>
          <PlateImage.Resizable
            css={[resizableStyles, isSelected && resizableSelectedStyles]}
            handleComponent={{
              left: (
                <Box
                  css={[handleLeftStyles, isSelected && handleSelectedStyles]}
                />
              ),
              right: (
                <Box
                  css={[handleRightStyles, isSelected && handleSelectedStyles]}
                />
              ),
            }}
            readOnly={readOnly}
            minWidth={150}
          >
            <PlateImage.Img css={imgStyles} />
          </PlateImage.Resizable>

          <PlateImage.Caption css={captionStyles} readOnly={readOnly}>
            <PlateImage.CaptionTextarea
              readOnly={readOnly}
              css={captionTextareaStyles}
              placeholder="Description of your image..."
            />
          </PlateImage.Caption>
        </figure>

        {children}
      </Draggable>
    </PlateImage.Root>
  );
};
