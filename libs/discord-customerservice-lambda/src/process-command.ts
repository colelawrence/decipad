import Boom from '@hapi/boom';
import { getDefined } from '@decipad/utils';
import tables from '@decipad/tables';
import { Command, CommandReply } from './command';
import commands from './commands';

async function verifyAuth(command: Command): Promise<string> {
  const discordUser = getDefined(command.member?.user, 'no command user');
  const userKeyId = `discord:${discordUser.id}`;

  const data = await tables();
  const userKey = await data.userkeys.get({ id: userKeyId });
  if (!userKey) {
    throw Boom.forbidden(`Could not find user key with id ${userKeyId}`);
  }

  const superAdmin = await data.superadminusers.get({
    id: userKey.user_id,
  });
  if (!superAdmin) {
    throw Boom.forbidden(
      `Could not find super admin permissions for your user`
    );
  }

  return userKey.user_id;
}

async function parseAndReplyToCommand(command: Command): Promise<string> {
  const userId = await verifyAuth(command);
  const commandData = getDefined(command.data, 'no command data');
  const options = { user_id: userId };
  switch (commandData.name) {
    case 'allowlist': {
      return commands.allowlist(commandData.options, options);
    }
    case 'superadmins': {
      return commands.superadmins(commandData.options, options);
    }
    default: {
      throw Boom.notImplemented(
        `command not recognized: ${(commandData as Command['data'])?.name}`
      );
    }
  }
}

export async function processCommand(command: Command): Promise<CommandReply> {
  console.log('processCommand:', command);
  const replyContent = await parseAndReplyToCommand(command);
  console.log('reply:', replyContent);
  return {
    tts: false,
    content: replyContent,
    embeds: [],
    allowed_mentions: { parse: [] },
  };
}
