import { nanoid } from 'nanoid';
import tables from '../tables';
import createWorkspace from '../workspaces/create';
import createPad from '../pads/create';

type UserInput = {
  name: string;
  image?: string;
  email?: string;
  provider: string;
  providerId?: ID;
};

async function create(user: UserInput): Promise<UserWithSecret> {
  const data = await tables();

  const newUser = {
    id: nanoid(),
    name: user.name,
    last_login: Date.now(),
    image: user.image,
    email: user.email,
    secret: nanoid(),
  };

  await data.users.put(newUser);

  if (user.provider && user.providerId) {
    const newUserKey = {
      id: `${user.provider}:${user.providerId}`,
      user_id: newUser.id,
    };

    await data.userkeys.put(newUserKey);
  }

  if (user.email) {
    const newEmailUserKey = {
      id: `email:${user.email}`,
      user_id: newUser.id,
    };

    await data.userkeys.put(newEmailUserKey);
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

export default create;

function userFirstName(user: User): string {
  return user.name.split(' ')[0];
}
