'use strict';

const arc = require('@architect/functions');
const tables = require('../../shared/tables');
const { nanoid } = require('nanoid');
const { UserInputError } = require('apollo-server-lambda');
const { check: checkAuthorized, requireUser } = require('../authorization');

const inTesting = !!process.env.JEST_WORKER_ID;

const resolvers = {
  Query: {
    async teams(parent, args, context) {
      const user = requireUser(context);
      const data = await tables();
      const permissions = await data.permissions.query({
        IndexName: 'byUserId',
        KeyConditionExpression:
          'user_id = :user_id and resource_type = :resource_type',
        ExpressionAttributeValues: {
          ':user_id': user.id,
          ':resource_type': 'teams',
        },
      });

      const teams = [];
      for (const permission of permissions.Items) {
        const team = await data.teams.get({ id: permission.resource_id });
        if (team) {
          teams.push(team);
        }
      }

      return teams;
    },
  },
  Mutation: {
    async createTeam(_, args, context) {
      const user = requireUser(context);

      const inputTeam = args.team;

      const newTeam = {
        id: nanoid(),
        name: inputTeam.name,
      };
      const data = await tables();

      await data.teams.put(newTeam);

      const teamResource = `/teams/${newTeam.id}`;
      const newTeamPermission = {
        id: `/users/${context.user.id}${teamResource}`,
        resource_type: 'teams',
        resource_uri: teamResource,
        resource_id: newTeam.id,
        user_id: user.id,
        type: 'ADMIN',
      };

      await data.permissions.put(newTeamPermission);

      return newTeam;
    },

    async inviteUserToTeam(_, { teamId, userId, permission }, context) {
      const sessionUser = await checkAuthorized(
        `/teams/${teamId}`,
        context,
        'WRITE'
      );
      const data = await tables();
      const team = await data.teams.get({ id: teamId });
      if (!team) {
        throw new UserInputError(`Team with id ${teamId} not found`);
      }

      const user = await data.users.get({ id: userId });
      if (!user) {
        throw new UserInputError(`User with id ${userId} not found`);
      }

      if (!user.email) {
        throw new Error('Invited user does not have email address');
      }

      const newInvite = {
        id: nanoid(),
        resource_type: 'teams',
        resource_id: team.id,
        user_id: user.id,
        invited_by_user_id: sessionUser.id,
        permission,
        expires_at:
          Math.round(Date.now() / 1000) +
          Number(process.env.DECI_INVITE_EXPIRATION_SECONDS),
      };

      await data.invites.put(newInvite);

      const inviteAcceptLink = `${
        inTesting
          ? `http://localhost:${process.env.PORT}`
          : process.env.DECI_APP_URL_BASE
      }/api/invites/${newInvite.id}/accept`;

      if (!inTesting) {
        await arc.queues.publish({
          name: 'sendemail',
          payload: {
            template: 'team-invite',
            from: sessionUser,
            to: user,
            team,
            inviteAcceptLink: inviteAcceptLink,
          },
        });
      }

      if (inTesting) {
        return inviteAcceptLink;
      }
    },

    async removeUserFromTeam(_, { teamId, userId }, context) {
      await checkAuthorized(`/teams/${teamId}`, context, 'WRITE');

      const data = await tables();
      const id = `/users/${userId}/teams/${teamId}`;
      await data.permissions.delete({ id });
    },

    async removeSelfFromTeam(_, { teamId }, context) {
      const resource = `/teams/${teamId}`;
      const sessionUser = await checkAuthorized(resource, context, 'READ');

      const data = await tables();

      const permissions = (
        await data.permissions.query({
          IndexName: 'byResource',
          KeyConditionExpression: 'resource_uri = :resource_uri',
          ExpressionAttributeValues: {
            ':resource_uri': resource,
          },
        })
      ).Items.filter((permission) => permission.type === 'ADMIN');

      if (
        permissions.length === 1 &&
        sessionUser.id === permissions[0].user_id
      ) {
        throw new UserInputError('Cannot remove unique admin user');
      }

      const permissionId = `/users/${sessionUser.id}${resource}`;
      await data.permissions.delete({ id: permissionId });
    },

    async removeTeam(_, { teamId }, context) {
      const resource = `/teams/${teamId}`;
      await checkAuthorized(resource, context, 'ADMIN');

      const data = await tables();

      const teamUsers = (
        await data.permissions.query({
          IndexName: 'byResource',
          KeyConditionExpression: 'resource_uri = :resource_uri',
          ExpressionAttributeValues: {
            ':resource_uri': resource,
          },
        })
      ).Items;

      for (const teamUser of teamUsers) {
        await data.permissions.delete({ id: teamUser.id });
      }

      await data.teams.delete({ id: teamId });
    },
  },
  Team: {
    async teamUsers(team, args, context) {
      const resource = `/teams/${team.id}`;
      await checkAuthorized(resource, context, 'READ');

      const data = await tables();

      return (
        await data.permissions.query({
          IndexName: 'byResource',
          KeyConditionExpression: 'resource_uri = :resource_uri',
          ExpressionAttributeValues: {
            ':resource_uri': resource,
          },
        })
      ).Items.map((permission) => ({
        user_id: permission.user_id,
        team_id: permission.resource_id,
        permission: permission.type,
      }));
    },
  },
  TeamUser: {
    async user(teamUser) {
      const data = await tables();
      return await data.users.get({ id: teamUser.user_id });
    },
    async team(teamUser) {
      const data = await tables();
      return await data.teams.get({ id: teamUser.team_id });
    },
  },
};

module.exports = resolvers;
