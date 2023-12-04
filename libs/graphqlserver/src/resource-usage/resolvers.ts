import { User, Workspace } from '@decipad/backendtypes';
import { getAiUsage, FrontendAiUsageRecord } from './queries.helpers';

export default {
  User: {
    async resourceUsages(user: User): Promise<Array<FrontendAiUsageRecord>> {
      return getAiUsage('users', user.id);
    },
  },
  Workspace: {
    async resourceUsages(
      workspace: Workspace
    ): Promise<Array<FrontendAiUsageRecord>> {
      return getAiUsage('workspaces', workspace.id);
    },
  },
};
