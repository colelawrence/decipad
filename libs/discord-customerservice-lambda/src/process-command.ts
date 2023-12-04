import { notImplemented, forbidden } from '@hapi/boom';
import { getDefined } from '@decipad/utils';
import tables from '@decipad/tables';
import { type Command, type CommandReply } from './command';
import commands from './commands';

async function verifyAuth(command: Command): Promise<string> {
  const discordUser = getDefined(command.member?.user, 'no command user');
  const userKeyId = `discord:${discordUser.id}`;

  const data = await tables();
  const userKey = await data.userkeys.get({ id: userKeyId });
  if (!userKey) {
    throw forbidden(`Could not find user key with id ${userKeyId}`);
  }

  const superAdmin = await data.superadminusers.get({
    id: userKey.user_id,
  });
  if (!superAdmin) {
    throw forbidden(`Could not find super admin permissions for your user`);
  }

  return userKey.user_id;
}

async function parseAndReplyToCommand(command: Command): Promise<string> {
  await verifyAuth(command);
  const commandData = getDefined(command.data, 'no command data');
  switch (commandData.name) {
    case 'allowlist': {
      return commands.allowlist(commandData.options);
    }
    case 'superadmins': {
      return commands.superadmins(commandData.options);
    }
    case 'templates': {
      return commands.templates(commandData.options);
    }
    default: {
      throw notImplemented(
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
