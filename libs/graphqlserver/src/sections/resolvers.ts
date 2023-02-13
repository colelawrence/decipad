import {
  GraphqlContext,
  ID,
  SectionInput,
  SectionRecord,
  Workspace,
} from '@decipad/backendtypes';
import { subscribe } from '@decipad/services/pubsub';
import tables from '@decipad/tables';
import { byAsc } from '@decipad/utils';
import { timestamp } from '@decipad/services/utils';
import Boom from '@hapi/boom';
import assert from 'assert';
import { nanoid } from 'nanoid';
import { isAuthenticatedAndAuthorized, requireUser } from '../authorization';

const resolvers = {
  Mutation: {
    async addSectionToWorkspace(
      _: unknown,
      { workspaceId, section }: { workspaceId: ID; section: SectionInput },
      context: GraphqlContext
    ): Promise<SectionRecord> {
      const resource = `/workspaces/${workspaceId}`;
      await isAuthenticatedAndAuthorized(resource, context, 'WRITE');

      const data = await tables();
      const newSection = {
        ...section,
        id: nanoid(),
        workspace_id: workspaceId,
        createdAt: timestamp(),
      };
      await data.sections.put(newSection);
      return newSection;
    },

    async addNotebookToSection(
      _: unknown,
      { sectionId, notebookId }: { sectionId: ID; notebookId: ID },
      context: GraphqlContext
    ) {
      const resource = `/pads/${notebookId}`;
      await isAuthenticatedAndAuthorized(resource, context, 'WRITE');

      const data = await tables();

      const pad = await data.pads.get({ id: notebookId });

      if (!pad) {
        throw Boom.notFound('Notebook does not exist');
      }

      const section = await data.sections.get({ id: sectionId });

      if (!section) {
        throw Boom.notFound('Section does not exist');
      }

      const workspaceResource = `/workspaces/${section.workspace_id}`;
      await isAuthenticatedAndAuthorized(workspaceResource, context, 'WRITE');

      if (section.workspace_id !== pad.workspace_id) {
        throw Boom.badRequest(
          'Section and notebook are not in the same workspace'
        );
      }

      const toUpdate = {
        ...pad,
        section_id: sectionId,
      };

      await data.pads.put(toUpdate);
    },

    async removeSectionFromWorkspace(
      _: unknown,
      { workspaceId, sectionId }: { workspaceId: ID; sectionId: ID },
      context: GraphqlContext
    ) {
      const resource = `/workspaces/${workspaceId}`;
      await isAuthenticatedAndAuthorized(resource, context, 'WRITE');

      const data = await tables();
      await data.sections.delete({ id: sectionId });
      return true;
    },

    async updateSectionInWorkspace(
      _: unknown,
      {
        workspaceId,
        sectionId,
        section,
      }: { workspaceId: ID; sectionId: ID; section: SectionInput },
      context: GraphqlContext
    ) {
      const resource = `/workspaces/${workspaceId}`;
      await isAuthenticatedAndAuthorized(resource, context, 'WRITE');

      const data = await tables();
      const oldSection = await data.sections.get({ id: sectionId });
      const toUpdate = {
        createdAt: timestamp(), // overwritten, for typescript
        ...oldSection,
        ...section,
        workspace_id: workspaceId,
        id: sectionId,
      };

      await data.sections.put(toUpdate);
    },
  },

  Subscription: {
    sectionsChanged: {
      async subscribe(
        _: unknown,
        { workspaceId }: { workspaceId: ID },
        context: GraphqlContext
      ) {
        const user = requireUser(context);
        assert(context.subscriptionId, 'no subscriptionId in context');
        assert(context.connectionId, 'no connectionId in context');
        return subscribe({
          subscriptionId: context.subscriptionId,
          connectionId: context.connectionId,
          user,
          type: 'sectionsChanged',
          filter: JSON.stringify({ workspaceId }),
        });
      },
    },
  },

  Workspace: {
    async sections(workspace: Workspace): Promise<SectionRecord[]> {
      const data = await tables();

      const query = {
        IndexName: 'byWorkspace',
        KeyConditionExpression: 'workspace_id = :workspace_id',
        ExpressionAttributeValues: {
          ':workspace_id': workspace.id,
        },
      };
      const res = (await data.sections.query(query)).Items.sort(
        byAsc('createdAt')
      );
      return res;
    },
  },
};

export default resolvers;
