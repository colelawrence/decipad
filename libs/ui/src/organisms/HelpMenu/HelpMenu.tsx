import { css, keyframes } from '@emotion/react';
import { ComponentProps, useCallback, useContext } from 'react';
import { ClientEventsContext } from '@decipad/client-events';
import { Link, MenuItem, MenuSeparator } from '../../atoms';
import { HelpButton, MenuList } from '../../molecules';
import { p12Regular, p14Medium, setCssVar, cssVar } from '../../primitives';
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

const iconLink = (
  <svg
    css={{
      float: 'right',
      marginTop: '1px',
      marginLeft: '1px',
    }}
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.58057 12.6694L10.2981 5.95192"
      stroke={cssVar('weakerTextColor')}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M12.4194 4.43079V9.45333C12.4194 9.98787 11.7731 10.2556 11.3952 9.87759L6.37263 4.85505C5.99465 4.47707 6.26235 3.83079 6.79689 3.83079L11.8194 3.83079C12.1508 3.83079 12.4194 4.09942 12.4194 4.43079Z"
      fill={cssVar('weakerTextColor')}
    />
  </svg>
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
          {title} {external && iconLink}
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
