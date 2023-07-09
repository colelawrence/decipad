import { NotebookAvatar } from './NotebookAvatars.types';
import { sortAvatars } from './sortAvatars';

describe('sortAvatars', () => {
  it('should sort avatars correctly', () => {
    const avatar1: NotebookAvatar = {
      user: {
        id: '123',
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
      permission: 'READ',
    };

    const avatar2: NotebookAvatar = {
      user: {
        id: '345',
        name: 'Alice Smith',
        email: 'alice.smith@example.com',
      },
      permission: 'WRITE',
    };

    const avatar3: NotebookAvatar = {
      user: {
        id: '456',
        name: 'Bob John',
        email: 'bob.john@example.com',
      },
      permission: 'ADMIN',
    };

    const avatar4: NotebookAvatar = {
      user: {
        id: '345',
        name: 'Zane Smith',
        email: 'zane.smith@example.com',
      },
      permission: 'WRITE',
    };

    const avatar5: NotebookAvatar = {
      user: {
        id: '345',
        name: 'Mary Smith',
        email: 'mary.smith@example.com',
      },
      permission: 'WRITE',
    };

    const avatars: NotebookAvatar[] = [
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
        user: { email: 'bob.john@example.com', id: '456', name: 'Bob John' },
      },
      {
        permission: 'WRITE',
        user: {
          email: 'alice.smith@example.com',
          id: '345',
          name: 'Alice Smith',
        },
      },
      {
        permission: 'WRITE',
        user: {
          email: 'mary.smith@example.com',
          id: '345',
          name: 'Mary Smith',
        },
      },
      {
        permission: 'WRITE',
        user: {
          email: 'zane.smith@example.com',
          id: '345',
          name: 'Zane Smith',
        },
      },
      {
        permission: 'READ',
        user: { email: 'john.doe@example.com', id: '123', name: 'John Doe' },
      },
    ]);
  });
});
