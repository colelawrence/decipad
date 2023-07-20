/* eslint decipad/css-prop-named-variable: 0 */
import { ClientEventsContext } from '@decipad/client-events';
import { css, keyframes } from '@emotion/react';
import { ComponentProps, useCallback, useContext, useState } from 'react';
import { useIntercom } from 'react-use-intercom';
import { Link, MenuItem, MenuSeparator } from '../../atoms';
import {
  ArrowDiagonalTopRight,
  Chat,
  Discord,
  Docs,
  LightBulb,
} from '../../icons';
import { HelpButton, MenuList } from '../../molecules';
import {
  offBlack,
  p12Regular,
  p14Medium,
  setCssVar,
  transparency,
  weakOpacity,
} from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';

const menuItemWrapperStyles = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '6px',
  textDecoration: 'none',
  minWidth: '170px',
  padding: '0px',
  alignItems: 'center',
});

const menuItemSmallTextStyles = css(
  p12Regular,
  setCssVar('normalTextColor', 'weakerTextColor')
);

const helpMenuStyles = css({
  position: 'fixed',
  bottom: '16px',
  right: '16px',
  zIndex: 66,
});

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(165, 254, 31, 0.6);
  }
  70% {
    box-shadow: 0 0 0 4px rgba(165, 254, 31, 0);
  }
  100% {
    box-shadow: 0 0 0 0px rgba(165, 254, 31, 0);
  }
`;

const statusIconStyles = css`
  display: flex;
  flex-direction: row;
  margin-left: 5px;
  margin-top: 6px;
  margin-right: 3px;
  width: 5px;
  height: 5px;
  background: #a5fe1f;
  box-shadow: 0px 0px 0px 3px rgba(165, 254, 31, 0.2);
  border-radius: 50%;
  animation: ${pulse} 1.5s ease infinite;
`;
const statusIcon = (
  <div css={{ alignSelf: 'start', height: '28px' }}>
    <div css={statusIconStyles}></div>
  </div>
);

const linkStyles = css({
  textDecoration: 'none',
});

interface CustomMenuItemProps
  extends Omit<ComponentProps<typeof MenuItem>, 'children'> {
  description?: string;
  title: string;
  to?: string;
  chat?: boolean;
  external?: boolean;
  readonly onClick: () => void;
}

const CustomMenuItem = ({
  description,
  onSelect,
  title,
  to,
  chat,
  external,
  onClick,
  icon,
}: CustomMenuItemProps) => {
  const followLink = useCallback(() => {
    if (to) {
      window.open(to, '_blank');
    }
  }, [to]);

  const children = (
    <div css={menuItemWrapperStyles}>
      <span css={{ width: '20px' }}>{icon}</span>
      <span css={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <span css={[p14Medium, { display: 'flex', gap: '8px' }]}>
          {title}

          {external && (
            <span
              css={{
                display: 'flex',
                alignItems: 'center',
                float: 'right',
                backgroundColor: transparency(offBlack, weakOpacity).rgba,
                borderRadius: '4px',
                height: '20px',
                width: '20px',
                padding: '5px',
                marginLeft: 'auto',
                opacity: '0',
                '*:hover > &': {
                  opacity: '1',
                },
                svg: {
                  width: '16px',
                  height: '16px',
                },
              }}
            >
              <ArrowDiagonalTopRight />
            </span>
          )}
        </span>
        {description !== undefined && (
          <small css={menuItemSmallTextStyles}>{description}</small>
        )}
      </span>
    </div>
  );
  return (
    <div
      css={
        chat && {
          '*:first-child': {
            paddingTop: '0px',
            paddingBottom: '0px',
          },
        }
      }
    >
      <MenuItem onSelect={onSelect ?? followLink}>
        {to !== undefined ? (
          <Link css={linkStyles} href={to} onClick={onClick}>
            {children}
          </Link>
        ) : (
          children
        )}
      </MenuItem>
    </div>
  );
};

interface HelpMenuProps {
  readonly discordUrl?: string;
  readonly docsUrl?: string;
  readonly releaseUrl?: string;
}

export const HelpMenu = ({
  discordUrl,
  docsUrl,
  releaseUrl,
}: HelpMenuProps) => {
  const clientEvent = useContext(ClientEventsContext);
  const [open, setOpen] = useState(false);

  const { show, showNewMessage } = useIntercom();
  const showFeedback = useCallback(() => {
    show();
    showNewMessage();
  }, [show, showNewMessage]);

  return (
    <MenuList
      root
      dropdown
      open={open}
      onChangeOpen={() => {
        if (!open) {
          clientEvent({
            type: 'action',
            action: 'help button clicked',
          });
        }
        setOpen(!open);
      }}
      trigger={
        <div css={[helpMenuStyles, hideOnPrint]}>
          <HelpButton />
        </div>
      }
      align="end"
      sideOffset={8}
    >
      <CustomMenuItem
        onSelect={show}
        title="Contact Live Support"
        description="Chat with our team"
        icon={statusIcon}
        onClick={() => {
          clientEvent({
            type: 'action',
            action: 'contact live support',
          });
        }}
      />
      <MenuSeparator />
      <CustomMenuItem
        to={releaseUrl}
        external
        title="What's New"
        icon={<LightBulb background />}
        onClick={() =>
          clientEvent({
            type: 'action',
            action: 'visit releases',
          })
        }
      />
      <CustomMenuItem
        to={docsUrl}
        external
        title="Docs & Examples"
        icon={<Docs />}
        onClick={() =>
          clientEvent({
            type: 'action',
            action: 'visit docs',
            props: {
              source: 'Help Button',
            },
          })
        }
      />
      <CustomMenuItem
        onSelect={showFeedback}
        title="Share Feedback"
        icon={<Chat />}
        onClick={() => {
          clientEvent({
            type: 'action',
            action: 'send feedback',
          });
        }}
      />
      <CustomMenuItem
        to={discordUrl}
        external
        title="Join Discord"
        icon={<Discord />}
        onClick={() =>
          clientEvent({
            type: 'action',
            action: 'join discord',
          })
        }
      />
    </MenuList>
  );
};
