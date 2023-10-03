import {
  APIBaseInteraction,
  InteractionType,
  APIInteractionResponseChannelMessageWithSource,
} from 'discord-api-types/payloads/v9/interactions';

// notebook

export type NotebookWriteApplicationCommandDataOption = {
  name: 'write';
  options: [
    {
      name: 'url';
      value: string;
    },
    {
      name: 'workspace';
      value: string;
    },
    {
      name: 'user';
      value: string;
    }
  ];
};

export type NotebookReadApplicationCommandDataOption = {
  name: 'read';
  options: [
    {
      name: 'url';
      value: string;
    }
  ];
};

export type NotebookApplicationCommandDataOption =
  | NotebookWriteApplicationCommandDataOption
  | NotebookReadApplicationCommandDataOption;

export type NotebookCommandData = {
  name: 'notebook';
  options: NotebookApplicationCommandDataOption[];
};

// allowlist

export type AllowlistAddApplicationCommandDataOption = {
  name: 'add';
  options: [
    {
      name: 'email';
      value: string;
    }
  ];
};

export type AllowlistRemoveApplicationCommandDataOption = {
  name: 'remove';
  options: [
    {
      name: 'email';
      value: string;
    }
  ];
};

export type AllowlistListApplicationCommandDataOption = {
  name: 'list';
};

export type AllowListApplicationCommandDataOption =
  | AllowlistAddApplicationCommandDataOption
  | AllowlistRemoveApplicationCommandDataOption
  | AllowlistListApplicationCommandDataOption;

export type AllowlistCommandData = {
  name: 'allowlist';
  options: AllowListApplicationCommandDataOption[];
};

// superadmins

export type SuperadminsAddApplicationCommandDataOption = {
  name: 'add';
  options: [
    {
      name: 'user';
      value: string;
    }
  ];
};

export type SuperadminsRemoveApplicationCommandDataOption = {
  name: 'remove';
  options: [
    {
      name: 'user';
      value: string;
    }
  ];
};

export type SuperadminsListApplicationCommandDataOption = {
  name: 'is';
  options: [
    {
      name: 'user';
      value: string;
    }
  ];
};

export type SuperadminsApplicationCommandDataOption =
  | SuperadminsAddApplicationCommandDataOption
  | SuperadminsRemoveApplicationCommandDataOption
  | SuperadminsListApplicationCommandDataOption;

export type TemplatesAddApplicationCommandDataOption = {
  name: 'add';
  options: [
    {
      name: 'url';
      value: string;
    }
  ];
};

export type TemplatesRemoveApplicationCommandDataOption = {
  name: 'remove';
  options: [
    {
      name: 'url';
      value: string;
    }
  ];
};

export type TemplatesListApplicationCommandDataOption = {
  name: 'list';
  options: [];
};

export type TemplatesApplicationCommandDataOption =
  | TemplatesAddApplicationCommandDataOption
  | TemplatesRemoveApplicationCommandDataOption
  | TemplatesListApplicationCommandDataOption;

export type SuperadminsCommandData = {
  name: 'superadmins';
  options: SuperadminsApplicationCommandDataOption[];
};

// ----------

export type ApplicationCommandDataOption =
  | AllowlistAddApplicationCommandDataOption
  | AllowlistRemoveApplicationCommandDataOption
  | AllowlistListApplicationCommandDataOption
  | SuperadminsAddApplicationCommandDataOption
  | SuperadminsRemoveApplicationCommandDataOption
  | SuperadminsListApplicationCommandDataOption;

export type ApplicationCommandDataOptions = ApplicationCommandDataOption[];

export type ApplicationCommandData =
  | AllowlistCommandData
  | SuperadminsCommandData;

export type Command = APIBaseInteraction<
  InteractionType.ApplicationCommand,
  ApplicationCommandData
>;

export type CommandReply =
  APIInteractionResponseChannelMessageWithSource['data'];
