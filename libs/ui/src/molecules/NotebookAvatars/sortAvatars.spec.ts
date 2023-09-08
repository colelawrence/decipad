import {
  PermissionType,
  UserAccessMetaFragment,
} from '@decipad/graphql-client';
import { sortAvatars } from './sortAvatars';

describe('sortAvatars', () => {
  it('should sort avatars correctly', () => {
    const avatar1: UserAccessMetaFragment = {
      user: {
        id: '123',
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
      permission: PermissionType.Read,
      canComment: true,
    };

    const avatar2: UserAccessMetaFragment = {
      user: {
        id: '345',
        name: 'Alice Smith',
        email: 'alice.smith@example.com',
      },
      permission: PermissionType.Write,
      canComment: true,
    };

    const avatar3: UserAccessMetaFragment = {
      user: {
        id: '456',
        name: 'Bob John',
        email: 'bob.john@example.com',
      },
      permission: PermissionType.Admin,
      canComment: true,
    };

    const avatar4: UserAccessMetaFragment = {
      user: {
        id: '345',
        name: 'Zane Smith',
        email: 'zane.smith@example.com',
      },
      permission: PermissionType.Write,
      canComment: true,
    };

    const avatar5: UserAccessMetaFragment = {
      user: {
        id: '345',
        name: 'Mary Smith',
        email: 'mary.smith@example.com',
      },
      permission: PermissionType.Write,
      canComment: true,
    };

    const avatars: UserAccessMetaFragment[] = [
      avatar1,
      avatar2,
      avatar3,
      avatar4,
      avatar5,
    ];

    const sortedAvatars = sortAvatars(avatars);

    expect(sortedAvatars).toEqual([
      {
        permission: 'ADMIN',
        canComment: true,
        user: { email: 'bob.john@example.com', id: '456', name: 'Bob John' },
      },
      {
        permission: 'WRITE',
        canComment: true,
        user: {
          email: 'alice.smith@example.com',
          id: '345',
          name: 'Alice Smith',
        },
      },
      {
        permission: 'WRITE',
        canComment: true,
        user: {
          email: 'mary.smith@example.com',
          id: '345',
          name: 'Mary Smith',
        },
      },
      {
        permission: 'WRITE',
        canComment: true,
        user: {
          email: 'zane.smith@example.com',
          id: '345',
          name: 'Zane Smith',
        },
      },
      {
        permission: 'READ',
        canComment: true,
        user: { email: 'john.doe@example.com', id: '123', name: 'John Doe' },
      },
    ]);
  });
});
