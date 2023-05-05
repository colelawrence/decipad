import { PropsWithChildren, useCallback, useState } from 'react';
import { css } from '@emotion/react';
import { Overlay } from '../../atoms';
import { useTrackWindowSize } from './useTrackWindowSize';

export type MobileSidebarProps = PropsWithChildren<{
  readonly trigger: React.ReactNode;
}>;

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  children,
  trigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isSmallScreen, isLoading } = useTrackWindowSize();

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, [setIsOpen]);

  if (isLoading) return null;
  if (!isSmallScreen) return <>{children}</>;

  return (
    <div>
      <div onClick={toggle}>{trigger}</div>
      {isOpen && (
        <div css={pageCoverStyles}>
          <div css={sidebarContentStyles}>{children}</div>
          <div css={overlayStyles}>
            <Overlay closeAction={toggle} />
          </div>
        </div>
      )}
    </div>
  );
};

const pageCoverStyles = css({
  position: 'fixed',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,

  overflow: 'scroll',
});

const overlayStyles = css({
  position: 'fixed',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  zIndex: -1,

  button: {
    height: '100%',
    width: '100%',
    position: 'absolute',
  },
});

const sidebarContentStyles = css({
  minHeight: 'min-content',
  maxWidth: '272px',
  overflow: 'visible',
});
