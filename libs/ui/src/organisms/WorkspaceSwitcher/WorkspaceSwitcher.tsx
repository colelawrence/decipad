import { css } from '@emotion/react';
import { ComponentProps, FC, useState } from 'react';
import { WorkspaceMenu } from '..';
import { Avatar, NavigationItem } from '../../atoms';
import { Chevron } from '../../icons';
import { cssVar, p15Medium, setCssVar } from '../../primitives';

const nameStyles = css(p15Medium, {
  height: '40px',
  maxWidth: '200px',
  padding: '12px 0',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const chevronStyles = css(
  setCssVar('currentTextColor', cssVar('weakTextColor')),
  {
    boxSizing: 'content-box',
    width: '9px',
    paddingLeft: `${4 + (16 - 9) / 2}px`,
    paddingRight: `${(16 - 9) / 2}px`,

    verticalAlign: 'middle',

    display: 'inline-grid',
  }
);

type WorkspaceSwitcherProps = ComponentProps<typeof WorkspaceMenu>;

export const WorkspaceSwitcher = (
  props: WorkspaceSwitcherProps
): ReturnType<FC> => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div css={{ position: 'relative' }}>
      <NavigationItem
        icon={<Avatar name={props.activeWorkspace.name} roundedSquare />}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <strong css={nameStyles}>
          {props.activeWorkspace.name}
          <span css={chevronStyles}>
            <Chevron type={menuOpen ? 'collapse' : 'expand'} />
          </span>
        </strong>
      </NavigationItem>
      {menuOpen && (
        <div
          css={{
            position: 'absolute',
            width: 'min(256px, 75vw)',
            top: 'calc(100% + 8px)',
            left: '48px',
          }}
        >
          <WorkspaceMenu {...props} />
        </div>
      )}
    </div>
  );
};
