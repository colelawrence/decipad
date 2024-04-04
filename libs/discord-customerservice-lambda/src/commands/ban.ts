import Boom from '@hapi/boom';
import tables from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import type {
  TemplatesApplicationCommandDataOption,
  BanApplicationCommandDataOption,
  BanUnbanAddApplicationCommandDataOption,
  BanBanAddApplicationCommandDataOption,
  BanIsBannedRemoveApplicationCommandDataOption,
} from '../command';
import type { CommandContext } from '../types';

async function banban(
  options: BanBanAddApplicationCommandDataOption['options'],
  context: CommandContext
): Promise<string> {
  const data = await tables();

  const userKey = await data.userkeys.get({ id: `email:${options[0].value}` });
  if (!userKey) {
    return 'Could not find user with that email';
  }

  const user = await data.users.get({ id: userKey.user_id });
  if (!user) {
    return `Could not find user with id ${userKey.user_id}`;
  }

  if (user.banned) {
    return 'User is already banned';
  }

  const reasonOption = getDefined(
    options.find((o) => o.name === 'reason'),
    'no option named reason'
  );

  const actorUserEmail =
    (await data.users.get({ id: context.actorUserId }))?.email ?? '<unknown>';

  user.banned = 1;
  user.bannedBy = actorUserEmail;
  user.bannedReason = reasonOption.value;

  await data.users.put(user);

  return `User banned`;
}

async function unban(
  options: BanUnbanAddApplicationCommandDataOption['options']
): Promise<string> {
  const data = await tables();

  const userKey = await data.userkeys.get({ id: `email:${options[0].value}` });
  if (!userKey) {
    return 'Could not find user with that email';
  }

  const user = await data.users.get({ id: userKey.user_id });
  if (!user) {
    return `Could not find user with id ${userKey.user_id}`;
  }

  if (!user.banned) {
    return 'User is not banned';
  }

  user.banned = 0;
  user.bannedBy = '';
  user.bannedReason = '';
  user.bannedWhen = 0;

  await data.users.put(user);

  return `User unbanned`;
}

async function isbanned(
  options: BanIsBannedRemoveApplicationCommandDataOption['options']
): Promise<string> {
  const data = await tables();

  const userKey = await data.userkeys.get({ id: `email:${options[0].value}` });
  if (!userKey) {
    return 'Could not find user with that email';
  }

  const user = await data.users.get({ id: userKey.user_id });
  if (!user) {
    return `Could not find user with id ${userKey.user_id}`;
  }

  if (!user.banned) {
    return 'User is not banned';
  }

  const when = user.bannedWhen
    ? new Date(user.bannedWhen).toUTCString()
    : '<unknown>';

  return `User is banned since ${when}. Reason: "${user.bannedReason}". Banned by: ${user.bannedBy}`;
}

export default function ban(
  options: BanApplicationCommandDataOption[],
  context: CommandContext
): Promise<string> {
  if (options.length !== 1) {
    throw Boom.notAcceptable('ban command should only have one option');
  }
  const option = options[0];
  switch (option.name) {
    case 'ban': {
      return banban(option.options, context);
    }
    case 'unban': {
      return unban(option.options);
    }
    case 'isbanned': {
      return isbanned(option.options);
    }
    default: {
      throw Boom.notAcceptable(
        `Unknown option ${
          (option as TemplatesApplicationCommandDataOption).name
        }`
      );
    }
  }
}
