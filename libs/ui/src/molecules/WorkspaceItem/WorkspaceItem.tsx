/* eslint decipad/css-prop-named-variable: 0 */
import { workspaces } from '@decipad/routing';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, useCallback } from 'react';
import { Avatar, NavigationItem } from '../../atoms';
import { Check } from '../../icons';
import { cssVar, p12Regular, p14Medium } from '../../primitives';

const maxWidth = '256px';
const pencilSize = '24px';
const avatarSize = '28px';
const padding = '8px';

const gridStyles = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '12px',

  width: '228px',
  maxWidth,
  marginTop: '-4px',
  marginBottom: '-4px',
});

const styles = css({
  flex: 1,
  padding: `${padding} 0`,

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',

  maxWidth: `calc(${maxWidth} - ${pencilSize} - (${padding} * 2))`,
});

const avatarStyles = css({
  height: avatarSize,
  width: avatarSize,
});

const checkmarkStyles = css({
  alignSelf: 'center',
  height: '14px',
  width: '14px',
});

export interface WorkspaceItemProps {
  readonly id: string;
  readonly name: string;
  readonly isActive?: boolean;
  readonly membersCount?: number;
  readonly onWorkspaceNavigate?: (id: string) => void;
}

export const WorkspaceItem = ({
  id,
  name,
  isActive,
  membersCount,
  onWorkspaceNavigate = noop,
}: WorkspaceItemProps): ReturnType<FC> => {
  const workspacePath = workspaces({}).workspace({ workspaceId: id });
  const handleNavigate = useCallback(() => {
    onWorkspaceNavigate(id);
  }, [id, onWorkspaceNavigate]);

  return (
    <NavigationItem
      href={workspacePath.$}
      onLinkClick={handleNavigate}
      icon={<Avatar name={name} email={name} useSecondLetter={false} />}
      iconStyles={avatarStyles}
    >
      <div css={gridStyles}>
        <span css={styles}>
          <strong
            css={css(
              p14Medium,

              {
                textAlign: 'left',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }
            )}
          >
            {name}
          </strong>
          <span
            css={css(p12Regular, {
              textAlign: 'left',
              color: cssVar('textSubdued'),
            })}
          >
            {membersCount} member{membersCount === 1 ? '' : 's'}
          </span>
        </span>

        {isActive && (
          <span css={checkmarkStyles}>
            <Check />
          </span>
        )}
      </div>
    </NavigationItem>
  );
};
