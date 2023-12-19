import { SectionRecord } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { byAsc, getDefined } from '@decipad/utils';
import { timestamp } from '@decipad/backend-utils';
import Boom from '@hapi/boom';
import { nanoid } from 'nanoid';
import { resource } from '@decipad/backend-resources';
import { isAuthenticatedAndAuthorized } from '../authorization';
import { Resolvers, Section } from '@decipad/graphqlserver-types';

const notebooks = resource('notebook');

const resolvers: Resolvers = {
  Mutation: {
    async addSectionToWorkspace(_, { workspaceId, section }, context) {
      const workspaceResource = `/workspaces/${workspaceId}`;
      await isAuthenticatedAndAuthorized(workspaceResource, context, 'WRITE');

      const data = await tables();
      const newSection: SectionRecord = {
        name: getDefined(section.name),
        color: getDefined(section.color),
        id: nanoid(),
        workspace_id: workspaceId,
        createdAt: timestamp(),
      };

      await data.sections.put(newSection);
      return newSection as Section;
    },

    async addNotebookToSection(_, { sectionId, notebookId }, context) {
      await notebooks.expectAuthorizedForGraphql({
        context,
        recordId: notebookId,
        minimumPermissionType: 'WRITE',
      });

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
      return true;
    },

    async removeSectionFromWorkspace(_, { workspaceId, sectionId }, context) {
      const workspaceResource = `/workspaces/${workspaceId}`;
      await isAuthenticatedAndAuthorized(workspaceResource, context, 'WRITE');

      const data = await tables();
      await data.sections.delete({ id: sectionId });
      return true;
    },

    async updateSectionInWorkspace(
      _,
      { workspaceId, sectionId, section },
      context
    ) {
      const workspaceResource = `/workspaces/${workspaceId}`;
      await isAuthenticatedAndAuthorized(workspaceResource, context, 'WRITE');

      const data = await tables();
      const oldSection = await data.sections.get({ id: sectionId });
      const toUpdate = {
        createdAt: timestamp(), // overwritten, for typescript
        ...oldSection,
        ...section,
        workspace_id: workspaceId,
        id: sectionId,
      } as SectionRecord;

      await data.sections.put(toUpdate);
      return true;
    },
  },

  Workspace: {
    async sections(workspace) {
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
      return res as Array<Section>;
    },
  },
};

export default resolvers;
