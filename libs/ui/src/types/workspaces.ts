import { Maybe, Workspace } from '@decipad/graphql-client';

export type Section = {
  id: string;
  name: string;
  color: string;
};

export type Plan = {
  key: string;
  title?: Maybe<string>;
  description?: Maybe<string>;
};

export type SectionRecord = {
  name: string;
  color: string;
  workspaceId: string;
};

export type WorkspaceMeta = Pick<
  Workspace,
  'id' | 'name' | 'membersCount' | 'isPremium'
> & {
  readonly sections: Section[];
} & {
  readonly isSelected: boolean;
} & {
  readonly plan?: Maybe<Plan>;
};
