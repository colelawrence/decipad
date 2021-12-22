import Boom from '@hapi/boom';
import { getDefined } from '@decipad/utils';
import tables from '@decipad/services/tables';
import { Command, CommandReply } from './command';
import commands from './commands';

async function verifyAuth(command: Command) {
  const discordUser = getDefined(command.member?.user, 'no command user');
  const userKeyId = `discord:${discordUser.id}`;

  const data = await tables();
  const userKey = await data.userkeys.get({ id: userKeyId });
  if (!userKey) {
    throw Boom.forbidden(`Could not find user key with id ${userKeyId}`);
  }

  const superAdmin = await data.superadminusers.get({
    user_id: userKey.user_id,
  });
  if (!superAdmin) {
    throw Boom.forbidden(
      `Could not find super admin permissions for your user`
    );
  }
}

async function parseAndReplyToCommand(command: Command): Promise<string> {
  await verifyAuth(command);
  const commandData = getDefined(command.data, 'no command data');
  const processor = commands[commandData.name];
  if (!processor) {
    throw Boom.notFound(`Invalid command name ${commandData.name}`);
  }
  return processor(commandData.options);
}

export async function processCommand(command: Command): Promise<CommandReply> {
  const replyContent = await parseAndReplyToCommand(command);
  return {
    tts: true,
    content: replyContent,
    embeds: [],
    allowed_mentions: { parse: [] },
  };
}
