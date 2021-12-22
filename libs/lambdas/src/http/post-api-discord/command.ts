import {
  APIBaseInteraction,
  InteractionType,
  APIInteractionResponseChannelMessageWithSource,
} from 'discord-api-types/payloads/v9/interactions';

export type AllowlistAddApplicationCommandDataOption = {
  name: 'add';
  options: [{ email: string }];
};

export type AllowlistRemoveApplicationCommandDataOption = {
  name: 'remove';
  options: [{ email: string }];
};

export type AllowlistListApplicationCommandDataOption = {
  name: 'list';
};

export type ApplicationCommandDataOption =
  | AllowlistAddApplicationCommandDataOption
  | AllowlistRemoveApplicationCommandDataOption
  | AllowlistListApplicationCommandDataOption;

export type ApplicationCommandDataOptions = ApplicationCommandDataOption[];

export type ApplicationCommandData = {
  name: 'allowlist'; // for now
  options: ApplicationCommandDataOptions;
};

export type Command = APIBaseInteraction<
  InteractionType.ApplicationCommand,
  ApplicationCommandData
>;

export type CommandReply =
  APIInteractionResponseChannelMessageWithSource['data'];
