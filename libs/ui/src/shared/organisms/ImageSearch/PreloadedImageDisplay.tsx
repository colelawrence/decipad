import { p13Medium } from 'libs/ui/src/primitives';
import { FC, useEffect, useState } from 'react';
import { Link } from '../../atoms';
import { ImageDisplay, ImageDisplayProps } from './ImageDisplay';

interface PreloadedImageDisplayProps extends Omit<ImageDisplayProps, 'src'> {
  src: string;
  author?: string;
  authorUrl?: string;
}

export const PreloadedImageDisplay: FC<PreloadedImageDisplayProps> = ({
  src,
  alt,
  author,
  authorUrl,
  trackUrl,
  insertFromPreview,
}) => {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  useEffect(() => {
    const image = new Image();
    image.src = src;

    const handleLoad = () => {
      setLoadedSrc(src);
    };

    image.addEventListener('load', handleLoad);

    return () => {
      image.removeEventListener('load', handleLoad);
      image.removeEventListener('error', (err) => console.error(err));
    };
  }, [src]); // Depend on src so this effect runs every time src changes

  return (
    <>
      <ImageDisplay
        src={loadedSrc || undefined}
        alt={alt}
        insertFromPreview={insertFromPreview}
        trackUrl={trackUrl}
        author={
          author && authorUrl ? (
            <div css={p13Medium}>
              By <Link href={authorUrl}>{author}</Link>
            </div>
          ) : undefined
        }
      />
    </>
  );
};
