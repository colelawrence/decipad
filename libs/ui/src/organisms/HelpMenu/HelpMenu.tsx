import { isFlagEnabled } from '@decipad/feature-flags';
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

const linkStyles = css({ textDecoration: 'none' });

interface CustomMenuItemProps
  extends Omit<ComponentProps<typeof MenuItem>, 'children'> {
  description: string;
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
  readonly onSelectSupport?: () => void;
  readonly onSelectFeedback?: () => void;
  readonly onSelectFeature?: () => void;
}

export const HelpMenu = ({
  discordUrl,
  docsUrl,
  onSelectSupport,
  onSelectFeedback,
  onSelectFeature,
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
        description="Contact us by email or chat"
      />
      <CustomMenuItem
        to={discordUrl}
        title="Join us on Discord"
        description="Ask or share in the community"
      />
      {isFlagEnabled('FEATURE_REQUEST') && (
        <>
          <MenuSeparator />
          <MenuItem onSelect={onSelectFeedback}>
            <span css={p14Medium}>Submit feedback</span>
          </MenuItem>
          <MenuItem onSelect={onSelectFeature}>
            <span css={p14Medium}>Request a feature</span>
          </MenuItem>
        </>
      )}
    </MenuList>
  );
};
