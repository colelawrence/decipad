/* eslint decipad/css-prop-named-variable: 0 */
import { useThemeFromStore } from '@decipad/react-contexts';
import { docs } from '@decipad/routing';
import { css } from '@emotion/react';
import { FC } from 'react';
import { Button } from '../../atoms';
import { Close } from '../../icons';
import { cssVar, p18Medium } from '../../primitives';
import { dashboard } from '../../styles';
import { useEventNoEffect } from '../../utils/useEventNoEffect';
import backgroundDark from './dashboard-cta-card-dark.png';
import backgroundPublish from './dashboard-cta-card-publish.png';

import background from './dashboard-cta-card.png';

const workspaceCTAScreenQuery = `@media (max-width: 1000px)`;

const workspaceCTACardSuperWrapperStyles = (
  variant: boolean,
  darkTheme: boolean
) =>
  css({
    margin: '2rem 0',
    borderRadius: '12px',
    padding: '24px',
    height: dashboard.CTAHeight,

    position: 'relative',

    backgroundColor: cssVar('highlightColor'),
    backgroundImage: `url(${
      variant ? backgroundPublish : darkTheme ? backgroundDark : background
    })`,
    backgroundPosition: 'right 0px bottom',
    backgroundSize: '1057px 210px',
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

const titleStyles = css(p18Medium, {
  lineHeight: '22px',
  maxWidth: '370px',
  color: cssVar('strongTextColor'),
});

const ctaStyles = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '16px',
});

interface WorkspaceCTACardProps {
  readonly onDismiss: () => void;
  readonly onCreateNewNotebook: () => void;
  readonly canDismiss: boolean;
  readonly variant?: boolean;
}

const WorkspaceCTACard: FC<WorkspaceCTACardProps> = ({
  onDismiss,
  canDismiss,
  onCreateNewNotebook,
  variant = false,
}) => {
  const onDismissClick = useEventNoEffect(onDismiss);
  const [darkTheme] = useThemeFromStore();

  return (
    <div css={workspaceCTACardSuperWrapperStyles(variant, darkTheme)}>
      {canDismiss ? (
        <div css={dismissWrapperStyles} onClick={onDismissClick}>
          <Close />
        </div>
      ) : null}
      <div css={ctaStyles}>
        <h2 css={titleStyles}>
          {variant
            ? 'When you publish a notebook it shows up here'
            : 'Gather information, build models in minutes and bring data-driven ideas to life'}
        </h2>
        {variant ? (
          <p>
            Share notebooks with all of your followers so they customize and
            make it their own
          </p>
        ) : null}
        <div css={{ display: 'inline-flex', gap: '8px' }}>
          <Button type="primary" onClick={onCreateNewNotebook}>
            Start with new notebook
          </Button>
          <Button type="secondary" href={docs({}).page({ name: 'gallery' }).$}>
            Explore our templates
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCTACard;
