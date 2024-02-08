import { User } from '@decipad/interfaces';
import { Avatar } from '../../../shared';
import { useEditUserModalStore } from '../EditUserModal/EditUserModal';
import { Settings } from '../../../icons';
import { useSession } from 'next-auth/react';
import * as Styled from './styles';

export const WorkspaceAccount: React.FC = () => {
  const openUserSettings = useEditUserModalStore((state) => state.open);
  const { data: session } = useSession();
  const user = session?.user as User;

  return (
    <Styled.ItemWrapper
      onClick={openUserSettings}
      data-testid="account-settings-button"
    >
      <Styled.AvatarWrapper>
        <Avatar
          name={user.name}
          imageHash={user.image}
          useSecondLetter={false}
        />
      </Styled.AvatarWrapper>
      {user.email === user.name ? (
        <Styled.Details>
          <Styled.Title title={user.email ?? undefined}>
            {user.email}
          </Styled.Title>
        </Styled.Details>
      ) : (
        <Styled.Details>
          <Styled.Title title={user.name}>{user.name}</Styled.Title>
          <Styled.Subtitle title={user.email ?? undefined}>
            {user.email}
          </Styled.Subtitle>
        </Styled.Details>
      )}

      <Styled.IconWrapper>
        <Settings />
      </Styled.IconWrapper>
    </Styled.ItemWrapper>
  );
};
