import type {
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

// templates

export type TemplatesCommandData = {
  name: 'templates';
  options: TemplatesApplicationCommandDataOption[];
};

// feature

export type FeatureAddCommandDataOption = {
  name: 'add';
  options: [{ name: 'url'; value: string }];
};

export type FeatureRemoveCommandDataOption = {
  name: 'remove';
  options: [{ name: 'url'; value: string }];
};

export type FeatureApplicationCommandDataOption =
  | FeatureAddCommandDataOption
  | FeatureRemoveCommandDataOption;

export type FeatureCommandData = {
  name: 'feature';
  options: FeatureApplicationCommandDataOption[];
};

// ban

export type BanBanAddApplicationCommandDataOption = {
  name: 'ban';
  options: [
    {
      name: 'email';
      value: string;
    },
    {
      name: 'reason';
      value: string;
    }
  ];
};

export type BanUnbanAddApplicationCommandDataOption = {
  name: 'unban';
  options: [
    {
      name: 'email';
      value: string;
    }
  ];
};

export type BanIsBannedRemoveApplicationCommandDataOption = {
  name: 'isbanned';
  options: [
    {
      name: 'email';
      value: string;
    }
  ];
};

export type BanApplicationCommandDataOption =
  | BanBanAddApplicationCommandDataOption
  | BanUnbanAddApplicationCommandDataOption
  | BanIsBannedRemoveApplicationCommandDataOption;

export type BanCommandData = {
  name: 'ban';
  options: BanApplicationCommandDataOption[];
};

// notebooks

export type NotebooksBanAddApplicationCommandDataOption = {
  name: 'ban';
  options: [
    {
      name: 'url';
      value: string;
    },
    {
      name: 'reason';
      value: string;
    }
  ];
};

export type NotebooksCopyApplicationCommandDataOption = {
  name: 'copy';
  options: [
    {
      name: 'url';
      value: string;
    }
  ];
};

export type NotebooksUnbanAddApplicationCommandDataOption = {
  name: 'unban';
  options: [
    {
      name: 'url';
      value: string;
    }
  ];
};

export type NotebooksIsBannedRemoveApplicationCommandDataOption = {
  name: 'isbanned';
  options: [
    {
      name: 'url';
      value: string;
    }
  ];
};

export type NotebooksApplicationCommandDataOption =
  | NotebooksBanAddApplicationCommandDataOption
  | NotebooksUnbanAddApplicationCommandDataOption
  | NotebooksIsBannedRemoveApplicationCommandDataOption
  | NotebooksCopyApplicationCommandDataOption;

export type NotebooksCommandData = {
  name: 'notebooks';
  options: NotebooksApplicationCommandDataOption[];
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
  | SuperadminsCommandData
  | TemplatesCommandData
  | FeatureCommandData
  | BanCommandData
  | NotebooksCommandData;

export type Command = APIBaseInteraction<
  InteractionType.ApplicationCommand,
  ApplicationCommandData
>;

export type CommandReply =
  APIInteractionResponseChannelMessageWithSource['data'];
