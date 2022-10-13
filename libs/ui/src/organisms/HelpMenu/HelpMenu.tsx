import { css } from '@emotion/react';
import { ComponentProps } from 'react';
import { Link, MenuItem, MenuSeparator } from '../../atoms';
import { HelpButton, MenuList } from '../../molecules';
import { p12Regular, p14Medium, setCssVar } from '../../primitives';

const menuItemWrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  textDecoration: 'none',
});

const menuItemSmallTextStyles = css(
  p12Regular,
  setCssVar('normalTextColor', 'weakerTextColor')
);

const triggerStyles = css({
  position: 'fixed',
  bottom: '16px',
  right: '16px',
});

const linkStyles = css({
  textDecoration: 'none',
});

interface CustomMenuItemProps
  extends Omit<ComponentProps<typeof MenuItem>, 'children'> {
  description?: string;
  title: string;
  to?: string;
}

const CustomMenuItem = ({
  description,
  onSelect,
  title,
  to,
}: CustomMenuItemProps) => {
  const children = (
    <div css={menuItemWrapperStyles}>
      <span css={p14Medium}>{title}</span>
      <small css={menuItemSmallTextStyles}>{description}</small>
    </div>
  );
  return (
    <MenuItem onSelect={onSelect}>
      {to !== undefined ? (
        <Link css={linkStyles} href={to}>
          {children}
        </Link>
      ) : (
        children
      )}
    </MenuItem>
  );
};

interface HelpMenuProps {
  readonly discordUrl?: string;
  readonly docsUrl?: string;
  readonly feedbackUrl?: string;
  readonly onSelectSupport?: () => void;
}

export const HelpMenu = ({
  discordUrl,
  docsUrl,
  onSelectSupport,
  feedbackUrl,
}: HelpMenuProps) => {
  return (
    <MenuList
      root
      dropdown
      trigger={
        <div css={triggerStyles}>
          <HelpButton />
        </div>
      }
      align="end"
      sideOffset={8}
    >
      <CustomMenuItem
        to={docsUrl}
        title="Help content"
        description="Explore the Decipad Docs"
      />
      <CustomMenuItem
        onSelect={onSelectSupport}
        title="Contact Support"
        description="Chat with the team"
      />
      <CustomMenuItem
        to={discordUrl}
        title="Join us on Discord"
        description="Ask or share in the community"
      />
      <MenuSeparator />
      <CustomMenuItem to={feedbackUrl} title="Share feedback" />
    </MenuList>
  );
};
