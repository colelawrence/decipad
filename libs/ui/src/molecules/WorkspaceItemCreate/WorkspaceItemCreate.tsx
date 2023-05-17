import { css } from '@emotion/react';
import { Avatar, NavigationItem } from '../../atoms';
import { cssVar, grey200, p14Medium } from '../../primitives';

type WorkspaceItemCreateProps = {
  readonly onClick: () => void;
};

export const WorkspaceItemCreate: React.FC<WorkspaceItemCreateProps> = ({
  onClick,
}) => {
  return (
    <NavigationItem
      onClick={onClick}
      icon={<Avatar name="+" backgroundColor={grey200} />}
      iconStyles={avatarStyles}
    >
      <div data-testid="create-workspace-button" css={textStyle}>
        Create workspace
      </div>
    </NavigationItem>
  );
};

const avatarSize = '28px';

const avatarStyles = css({
  height: avatarSize,
  width: avatarSize,
  padding: '20px 0',
});

const textStyle = css(p14Medium, {
  textAlign: 'left',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: cssVar('weakTextColor'),
});
