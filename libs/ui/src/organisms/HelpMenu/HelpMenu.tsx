import { ClientEventsContext } from '@decipad/client-events';
import { css, keyframes } from '@emotion/react';
import { ComponentProps, useCallback, useContext } from 'react';
import { ExternalHrefIcon, Link, MenuItem, MenuSeparator } from '../../atoms';
import { HelpButton, MenuList } from '../../molecules';
import { p12Regular, p14Medium, setCssVar } from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';

const menuItemWrapperStyles = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '6px',
  textDecoration: 'none',
  minWidth: '160px',
  padding: '0px',
});

const menuItemSmallTextStyles = css(
  p12Regular,
  setCssVar('normalTextColor', 'weakerTextColor')
);

const helpMenuStyles = css({
  position: 'fixed',
  bottom: '16px',
  right: '16px',
  zIndex: 2,
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

const statusIcon = css`
  display: flex;
  flex-direction: row;
  margin-left: 3px;
  margin-top: 6px;
  margin-right: 3px;
  width: 5px;
  height: 5px;
  background: #a5fe1f;
  box-shadow: 0px 0px 0px 3px rgba(165, 254, 31, 0.2);
  border-radius: 50%;
  animation: ${pulse} 1.5s ease infinite;
`;

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
}: CustomMenuItemProps) => {
  const followLink = useCallback(() => {
    if (to) {
      window.open(to, '_blank');
    }
  }, [to]);

  const children = (
    <div css={menuItemWrapperStyles}>
      {chat && <div css={statusIcon}></div>}
      <span css={{ display: 'flex', flexDirection: 'column' }}>
        <span css={p14Medium}>
          {title} {external && <ExternalHrefIcon />}
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
        chat
          ? {
              '*:first-child': {
                paddingTop: '0px',
                paddingBottom: '0px',
              },
            }
          : { marginLeft: '16px' }
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
  readonly onSelectSupport?: () => void;
}

export const HelpMenu = ({
  discordUrl,
  docsUrl,
  onSelectSupport,
}: HelpMenuProps) => {
  const clientEvent = useContext(ClientEventsContext);
  return (
    <MenuList
      root
      dropdown
      trigger={
        <div css={[helpMenuStyles, hideOnPrint]}>
          <HelpButton />
        </div>
      }
      align="end"
      sideOffset={8}
    >
      <CustomMenuItem
        onSelect={onSelectSupport}
        title="Contact Live Support"
        description="Chat with our team"
        chat
        onClick={() =>
          clientEvent({
            type: 'action',
            action: 'contact live support',
          })
        }
      />
      <MenuSeparator />
      <CustomMenuItem
        to={docsUrl}
        external
        title="Docs & Examples"
        onClick={() =>
          clientEvent({
            type: 'action',
            action: 'visit docs',
          })
        }
      />
      <CustomMenuItem
        title="Share Feedback"
        onClick={() =>
          clientEvent({
            type: 'action',
            action: 'send feedback',
          })
        }
      />
      <CustomMenuItem
        to={discordUrl}
        external
        title="Join Discord"
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
