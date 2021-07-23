import { nanoid } from 'nanoid';
import tables from '../tables';
import createWorkspace from '../workspaces/create';
import createPad from '../pads/create';
import timestamp from '../utils/timestamp';

type UserInput = {
  name: string;
  image?: string;
  email?: string;
  provider: string;
  providerId?: ID;
};

export default async function createUser(
  user: UserInput
): Promise<UserWithSecret> {
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
