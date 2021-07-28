import { UserInput, User, UserWithSecret } from '@decipad/backendtypes';
import { nanoid } from 'nanoid';
import tables from '../tables';
import { create as createWorkspace } from '../workspaces/create';
import { create as createPad } from '../pads/create';
import timestamp from '../common/timestamp';

export async function create(user: UserInput): Promise<UserWithSecret> {
  const data = await tables();

  const newUser = {
    id: nanoid(),
    name: user.name,
    last_login: timestamp(),
    image: user.image,
    email: user.email,
    secret: nanoid(),
  };

  await data.users.create(newUser);

  if (user.provider && user.providerId) {
    const newUserKey = {
      id: `${user.provider}:${user.providerId}`,
      user_id: newUser.id,
    };

    await data.userkeys.create(newUserKey);
  }

  if (user.email) {
    const newEmailUserKey = {
      id: `email:${user.email}`,
      user_id: newUser.id,
    };

    await data.userkeys.create(newEmailUserKey);
  }

  const firstName = userFirstName(newUser);
  const workspaceName = firstName ? `${firstName}'s Workspace` : 'My Workspace';
  const workspace = await createWorkspace(
    {
      name: workspaceName,
    },
    newUser
  );

  await createPad(
    workspace.id,
    {
      name: 'My first pad',
    },
    newUser
  );

  return newUser;
}

function userFirstName(user: User): string {
  return user.name.split(' ')[0];
}
