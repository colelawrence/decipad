import Boom from '@hapi/boom';
import { nanoid } from 'nanoid';
import tables from '@decipad/services/tables';
import { getDefined } from '@decipad/utils';
import {
  SuperadminsAddApplicationCommandDataOption,
  SuperadminsRemoveApplicationCommandDataOption,
  SuperadminsApplicationCommandDataOption,
} from '../command';

async function add(
  options: SuperadminsAddApplicationCommandDataOption['options']
): Promise<string> {
  const option = getDefined(
    options.find((o) => o.name === 'user'),
    'no option named user'
  );
  const data = await tables();
  const userId = option.value;
  const userKeyString = `discord:${userId}`;
  let userKey = await data.userkeys.get({ id: userKeyString });
  if (!userKey) {
    const user = {
      id: nanoid(),
      secret: nanoid(),
      name: `Discord user ${userId}`,
    };
    await data.users.create(user);
    userKey = { id: userKeyString, user_id: user.id };
    await data.userkeys.create(userKey);
  }

  const exists = await data.superadminusers.get({ id: userKey.user_id });
  if (exists) {
    return 'User already in the superadmins list';
  }
  await data.superadminusers.put({ id: userKey.user_id });
  return `Discord user successfully added to the superadmins list`;
}

async function remove(
  options: SuperadminsRemoveApplicationCommandDataOption['options']
): Promise<string> {
  const option = getDefined(
    options.find((o) => o.name === 'user'),
    'no option named user'
  );
  const data = await tables();
  const userId = option.value;
  const userKeyString = `discord:${userId}`;
  const userKey = await data.userkeys.get({ id: userKeyString });
  if (!userKey) {
    throw Boom.notFound('Could not find key for given discord user id');
  }
  const superAdmin = await data.superadminusers.get({ id: userKey.user_id });
  if (!superAdmin) {
    throw Boom.notFound('Given discord user is not in the superadmins list');
  }
  await data.superadminusers.delete({ id: userKey.user_id });

  return `Discord user successfully removed from the superadmins list`;
}

async function is(
  options: SuperadminsAddApplicationCommandDataOption['options']
): Promise<string> {
  const option = getDefined(
    options.find((o) => o.name === 'user'),
    'no option named user'
  );
  const data = await tables();
  const userId = option.value;
  const userKeyString = `discord:${userId}`;
  const userKey = await data.userkeys.get({ id: userKeyString });
  if (!userKey) {
    return `Given discord user is not registered`;
  }

  const isSuperAdmin = await data.superadminusers.get({ id: userKey.user_id });
  return `Discord user ${
    isSuperAdmin ? 'is' : 'is **not**'
  } in the superadmins list`;
}

export default function superadmnins(
  options: SuperadminsApplicationCommandDataOption[]
): Promise<string> {
  if (options.length !== 1) {
    throw Boom.notAcceptable('superadmins command should only have one option');
  }
  const option = options[0];
  switch (option.name) {
    case 'add': {
      return add(option.options);
    }
    case 'remove': {
      return remove(option.options);
    }
    case 'is': {
      return is(option.options);
    }
    default: {
      throw Boom.notAcceptable(
        `Unknown option ${
          (option as SuperadminsApplicationCommandDataOption).name
        }`
      );
    }
  }
}
