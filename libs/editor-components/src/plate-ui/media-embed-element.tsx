import type {
  MediaEmbedElement as MediaEmbedElementType,
  MyElement,
  PlateComponent,
} from '@decipad/editor-types';
import { cn, componentCssVars, p14Regular } from '@decipad/ui';
import { SerializedStyles, css } from '@emotion/react';
import { PlateElement, withHOC } from '@udecode/plate-common';
import {
  ELEMENT_MEDIA_EMBED,
  parseTwitterUrl,
  parseVideoUrl,
  useMediaState,
} from '@udecode/plate-media';
import { ResizableProvider, useResizableStore } from '@udecode/plate-resizable';
import type { ComponentProps, FC, ReactNode } from 'react';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import { Tweet } from 'react-tweet';
import { DraggableBlock } from '../block-management/index';
import { Caption, CaptionTextarea } from './caption';
import { draggableStyles } from './image-element';
import { MediaPopover } from './media-popover';
import {
  Resizable,
  ResizeHandle,
  mediaResizeHandleVariants,
} from './resizable';

const resizableSelectedStyles = css({
  background: componentCssVars('TableSelectionBackgroundColor'),
});

type Component = PlateComponent<{
  draggableBlock: FC<
    ComponentProps<typeof DraggableBlock> & {
      readonly element: MyElement;
      readonly children: ReactNode;
      draggableCss?: SerializedStyles;
    }
  >;
  readOnly?: boolean;
}>;

export const MediaEmbedElement: Component = withHOC(
  ResizableProvider,
  ({ draggableBlock: Draggable, readOnly, className, ...props }) => {
    const { children, element } = props;

    const {
      align = 'center',
      focused,
      selected,
      embed,
      isTweet,
      isVideo,
      isYoutube,
    } = useMediaState({
      urlParsers: [parseTwitterUrl, parseVideoUrl],
    });
    const width = useResizableStore().get.width();
    const provider = embed?.provider;

    const isSelected = !readOnly && focused && selected;

    return (
      <MediaPopover pluginKey={ELEMENT_MEDIA_EMBED}>
        <PlateElement
          className={cn('relative py-2.5', className)}
          {...(props as any)}
        >
          <Draggable
            blockKind="media"
            element={element as MediaEmbedElementType}
            draggableCss={draggableStyles}
          >
            <figure
              className="group relative m-0 w-full"
              contentEditable={false}
            >
              <Resizable
                css={isSelected && resizableSelectedStyles}
                align={align}
                options={{
                  align,
                  readOnly,
                  maxWidth: isTweet ? 550 : '100%',
                  minWidth: isTweet ? 300 : 100,
                }}
              >
                {!readOnly && (
                  <ResizeHandle
                    options={{ direction: 'left' }}
                    className={mediaResizeHandleVariants({ direction: 'left' })}
                  />
                )}

                {isVideo ? (
                  isYoutube ? (
                    <LiteYouTubeEmbed
                      id={embed!.id!}
                      title="youtube"
                      wrapperClass={cn(
                        'rounded-sm',
                        'relative block cursor-pointer bg-black bg-cover bg-center [contain:content]',
                        '[&.lyt-activated]:before:absolute [&.lyt-activated]:before:top-0 [&.lyt-activated]:before:h-[60px] [&.lyt-activated]:before:w-full [&.lyt-activated]:before:bg-top [&.lyt-activated]:before:bg-repeat-x [&.lyt-activated]:before:pb-[50px] [&.lyt-activated]:before:[transition:all_0.2s_cubic-bezier(0,_0,_0.2,_1)]',
                        '[&.lyt-activated]:before:bg-[url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADGCAYAAAAT+OqFAAAAdklEQVQoz42QQQ7AIAgEF/T/D+kbq/RWAlnQyyazA4aoAB4FsBSA/bFjuF1EOL7VbrIrBuusmrt4ZZORfb6ehbWdnRHEIiITaEUKa5EJqUakRSaEYBJSCY2dEstQY7AuxahwXFrvZmWl2rh4JZ07z9dLtesfNj5q0FU3A5ObbwAAAABJRU5ErkJggg==)]',
                        'after:block after:pb-[var(--aspect-ratio)] after:content-[""]',
                        '[&_>_iframe]:absolute [&_>_iframe]:left-0 [&_>_iframe]:top-0 [&_>_iframe]:size-full',
                        '[&_>_.lty-playbtn]:z-[1] [&_>_.lty-playbtn]:h-[46px] [&_>_.lty-playbtn]:w-[70px] [&_>_.lty-playbtn]:rounded-[14%] [&_>_.lty-playbtn]:bg-[#212121] [&_>_.lty-playbtn]:opacity-80 [&_>_.lty-playbtn]:[transition:all_0.2s_cubic-bezier(0,_0,_0.2,_1)]',
                        '[&:hover_>_.lty-playbtn]:bg-[red] [&:hover_>_.lty-playbtn]:opacity-100',
                        '[&_>_.lty-playbtn]:before:border-y-[11px] [&_>_.lty-playbtn]:before:border-l-[19px] [&_>_.lty-playbtn]:before:border-r-0 [&_>_.lty-playbtn]:before:border-[transparent_transparent_transparent_#fff] [&_>_.lty-playbtn]:before:content-[""]',
                        '[&_>_.lty-playbtn]:absolute [&_>_.lty-playbtn]:left-1/2 [&_>_.lty-playbtn]:top-1/2 [&_>_.lty-playbtn]:[transform:translate3d(-50%,-50%,0)]',
                        '[&_>_.lty-playbtn]:before:absolute [&_>_.lty-playbtn]:before:left-1/2 [&_>_.lty-playbtn]:before:top-1/2 [&_>_.lty-playbtn]:before:[transform:translate3d(-50%,-50%,0)]',
                        '[&.lyt-activated]:cursor-[unset]',
                        '[&.lyt-activated]:before:pointer-events-none [&.lyt-activated]:before:opacity-0',
                        '[&.lyt-activated_>_.lty-playbtn]:pointer-events-none [&.lyt-activated_>_.lty-playbtn]:!opacity-0'
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        provider === 'vimeo' && 'pb-[75%]',
                        provider === 'youku' && 'pb-[56.25%]',
                        provider === 'dailymotion' && 'pb-[56.0417%]',
                        provider === 'coub' && 'pb-[51.25%]'
                      )}
                    >
                      <iframe
                        className={cn(
                          'absolute left-0 top-0 size-full rounded-sm border-0'
                        )}
                        src={embed!.url}
                        title="embed"
                        allowFullScreen
                      />
                    </div>
                  )
                ) : null}

                {isTweet && (
                  <div className={cn('[&_.react-tweet-theme]:my-0')}>
                    <Tweet id={embed!.id!} />
                  </div>
                )}

                {!readOnly && (
                  <ResizeHandle
                    options={{ direction: 'right' }}
                    className={mediaResizeHandleVariants({
                      direction: 'right',
                    })}
                  />
                )}
              </Resizable>

              <Caption readOnly={readOnly} align={align} style={{ width }}>
                <CaptionTextarea
                  readOnly={readOnly}
                  css={p14Regular}
                  placeholder="Your description..."
                />
              </Caption>
            </figure>

            {children}
          </Draggable>
        </PlateElement>
      </MediaPopover>
    );
  }
);
