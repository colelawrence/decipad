import {
  Box,
  Caption,
  ElementPopover,
  Media,
  MediaEmbed as PlateMediaEmbed,
  mediaFloatingOptions,
  Resizable,
  useMediaStore,
} from '@udecode/plate';
import { ComponentProps, FC, ReactNode } from 'react';
import type {
  MediaEmbedElement,
  MyElement,
  PlateComponent,
} from '@decipad/editor-types';
import { useFocused, useSelected } from 'slate-react';
import { css } from '@emotion/react';
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
  rootStyles,
} from './styles';

type Component = PlateComponent<{
  draggableBlock: FC<
    ComponentProps<typeof DraggableBlock> & {
      readonly element: MyElement;
      readonly children: ReactNode;
    }
  >;
  readOnly?: boolean;
  pluginKey?: string;
}>;

export const MediaEmbed: Component = ({
  draggableBlock: Draggable,
  readOnly,
  pluginKey,
  ...props
}) => {
  const { children, element } = props;

  const focused = useFocused();
  const selected = useSelected();

  const { provider } = useMediaStore().get.urlData();

  const providersPadding: Record<string, string> = {
    youtube: '56.2061%',
    vimeo: '75%',
    youku: '56.25%',
    dailymotion: '56.0417%',
    coub: '51.25%',
  };
  const providerPadding =
    provider !== 'twitter'
      ? (provider && providersPadding[provider]) || '56.0417%'
      : undefined;

  const isSelected = !readOnly && focused && selected;

  return (
    <ElementPopover
      content={<FloatingMedia pluginKey={pluginKey} />}
      floatingOptions={mediaFloatingOptions}
    >
      <Media.Root css={rootStyles} {...(props as any)}>
        <Draggable
          blockKind="media"
          element={element as MediaEmbedElement}
          draggableCss={draggableStyles}
        >
          <figure
            css={[
              figureStyles,
              provider === 'twitter' &&
                css`
                  .twitter-tweet {
                    margin: 0 auto !important;
                    padding: 2px;
                  }
                `,
            ]}
            contentEditable={false}
          >
            <Resizable
              css={[resizableStyles, isSelected && resizableSelectedStyles]}
              maxWidth={provider === 'twitter' ? 550 : '100%'}
              minWidth={provider === 'twitter' ? 330 : 150}
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
            >
              <div
                css={css`
                  padding-bottom: ${providerPadding};
                `}
              >
                <PlateMediaEmbed
                  css={css`
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 3px;
                  `}
                />
              </div>
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
