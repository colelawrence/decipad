import { css } from '@emotion/react';
import { Giphy, Replicate, Unsplash } from 'libs/ui/src/icons';
import { p12Regular, p13Medium, smallestDesktop } from 'libs/ui/src/primitives';
import { deciOverflowYStyles } from 'libs/ui/src/styles/scrollbars';
import React from 'react';
import { Link } from '../../atoms';
import { ImageDisplay } from './ImageDisplay';
import { PreloadedImageDisplay } from './PreloadedImageDisplay';

export type ImageUrlWithMetadata = {
  url: string;
  user: string;
  userProfile: string;
  trackUrl: string;
};

export interface ImageGalleryProps {
  imageUrls?: string[] | ImageUrlWithMetadata[];
  loading: boolean;
  count: number;
  apiSource: 'replicate' | 'giphy' | 'unsplash';
  insertFromPreview: (url: string, trackUrl?: string) => void;
}

const galleryStyle = css`
  column-count: 2;
  column-gap: 10px;
  padding: 4px;
  width: 100%;

  @media (max-width: ${smallestDesktop.portrait.width}px) {
    column-count: 1;
  }
`;

const tabsContentScrollStyles = css(
  {
    width: 'calc(100% + 8px)',
    height: 'min(40vh, 400px)',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  deciOverflowYStyles
);

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  imageUrls,
  loading,
  count,
  apiSource,
  insertFromPreview,
}) => (
  <div css={tabsContentScrollStyles}>
    <div css={galleryStyle}>
      {!loading && imageUrls?.length === 0 && (
        <div css={p12Regular}>No results</div>
      )}
      {loading
        ? Array.from({ length: count }, (_, index) => (
            <ImageDisplay
              key={index}
              alt={'Loading...'}
              insertFromPreview={insertFromPreview}
            />
          ))
        : imageUrls
        ? imageUrls.map((item, index) => {
            const hasMetadata = typeof item !== 'string';
            const src = hasMetadata ? item.url : item;
            const author = hasMetadata ? item.user : undefined;
            const authorUrl = hasMetadata ? item.userProfile : undefined;
            const trackUrl = hasMetadata ? item.trackUrl : undefined;
            const alt = hasMetadata
              ? `Image from ${apiSource}`
              : `Image by ${author} on ${apiSource}`;
            return (
              <PreloadedImageDisplay
                insertFromPreview={insertFromPreview}
                key={index}
                src={src}
                author={author}
                authorUrl={authorUrl}
                alt={alt}
                trackUrl={trackUrl}
              />
            );
          })
        : null}
    </div>
    {imageUrls && imageUrls.length > 0 && (
      <div css={poweredByStyles}>
        Powered by{' '}
        {apiSource === 'replicate' ? (
          <Replicate />
        ) : apiSource === 'giphy' ? (
          <Giphy />
        ) : (
          <Unsplash />
        )}
        <Link href={`https://${apiSource}.com`}>{apiSource}</Link>
      </div>
    )}
  </div>
);

const poweredByStyles = css(
  p13Medium,
  { marginLeft: 6, display: 'flex', flexDirection: 'row', gap: 8 },
  { svg: { width: 12, height: 12 } }
);
