import { css } from '@emotion/react';
import { FC } from 'react';
import { Button } from '../../atoms';
import { Close } from '../../icons';
import { grey100, p18Medium } from '../../primitives';
import background from './card-image.svg';
import { useMouseEventNoEffect } from '../../utils/useMouseEventNoEffect';

const workspaceCTAScreenQuery = `@media (max-width: 1000px)`;

const workspaceCTACardSuperWrapperStyles = css({
  marginBottom: '2rem',
  borderRadius: '12px',
  padding: '24px',
  height: '210px',

  position: 'relative',

  backgroundColor: grey100.rgb,
  backgroundImage: `url(${background})`,
  backgroundPosition: 'right 20px bottom',
  backgroundRepeat: 'no-repeat',
  [workspaceCTAScreenQuery]: {
    display: 'none',
  },
});

const dismissWrapperStyles = css({
  position: 'absolute',
  right: '8px',
  top: '8px',
  cursor: 'pointer',
  width: '18px',
});

const titleStyles = css(p18Medium, { lineHeight: '22px', maxWidth: '370px' });

const ctaStyles = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '16px',
});

interface WorkspaceCTACardProps {
  readonly onDismiss: () => void;
  readonly onCreateNewNotebook: () => void;
}

const WorkspaceCTACard: FC<WorkspaceCTACardProps> = ({
  onDismiss,
  onCreateNewNotebook,
}) => {
  const onDismissClick = useMouseEventNoEffect(onDismiss);
  return (
    <div css={workspaceCTACardSuperWrapperStyles}>
      <div css={dismissWrapperStyles} onClick={onDismissClick}>
        <Close />
      </div>
      <div css={ctaStyles}>
        <h2 css={titleStyles}>
          Gather information, build models in minutes and bring data-driven
          ideas to life
        </h2>
        <Button type="primaryBrand" onClick={onCreateNewNotebook}>
          Start with new notebook
        </Button>
      </div>
    </div>
  );
};

export default WorkspaceCTACard;
