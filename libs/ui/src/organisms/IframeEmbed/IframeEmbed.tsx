/* eslint decipad/css-prop-named-variable: 0 */
import {
  IframeEmbedElement,
  MyElement,
  PlateComponent,
} from '@decipad/editor-types';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { ComponentProps, FC, ReactNode } from 'react';
import { DraggableBlock } from '../DraggableBlock/DraggableBlock';
import { draggableStyles } from '../MediaEmbed/styles';

export const iframeStyles = css({
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

type IframeEmbedComponent = PlateComponent<{
  draggableBlock: FC<
    ComponentProps<typeof DraggableBlock> & {
      readonly element: MyElement;
      readonly children: ReactNode;
    }
  >;
  onDrop?: any;
}>;

export const IframeEmbed: IframeEmbedComponent = ({
  draggableBlock: Draggable,
  onDrop,
  ...props
}) => {
  const { children, element } = props;
  const { url } = element as IframeEmbedElement;

  return (
    <Draggable
      blockKind="media"
      element={element as IframeEmbedElement}
      draggableCss={draggableStyles}
      onDrop={onDrop}
    >
      <IFrameContainerDiv>
        <ResponsiveIFrame
          title="decipad-embed"
          src={url}
          allow="fullscreen"
          allowFullScreen
          width="100%"
          height="100%"
        />
        {children}
      </IFrameContainerDiv>
    </Draggable>
  );
};

const IFrameContainerDiv = styled.div({
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  paddingTop: '66.6%', // belzebu V"""V, 16/9 would be 56.25%
});

const ResponsiveIFrame = styled.iframe({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: '100%',
  height: '100%',
});
