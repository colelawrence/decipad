import { FC } from 'react';
import { NotebookAvatar } from '../../molecules';

type PermissionType = 'ADMIN' | 'READ' | 'WRITE';

interface NotebookUser {
  user: {
    id: string;
    name: string;
  };
  permission: PermissionType | null;
}

interface NotebookUsersProps {
  users: NotebookUser[];
  visible?: boolean;
}

export const NotebookUsers = ({
  users,
  visible = undefined,
}: NotebookUsersProps): ReturnType<FC> => {
  return (
    <div css={{ display: 'flex', alignItems: 'center' }}>
      {users.map((user) => (
        <NotebookAvatar
          key={user.user.id}
          name={user.user.name}
          permission={user.permission || 'VIEWER'}
          visible={visible}
        />
      ))}
    </div>
  );
};
