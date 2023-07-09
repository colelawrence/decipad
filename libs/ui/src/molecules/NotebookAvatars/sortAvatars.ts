import { NotebookAvatar } from './NotebookAvatars.types';

const sortCriteria = {
  ADMIN: 0,
  WRITE: 1,
  READ: 2,
};

export const sortAvatars = (jsonList: NotebookAvatar[]) =>
  jsonList.sort((a, b) => {
    const permissionA = a.permission;
    const permissionB = b.permission;

    const criteriaComparison =
      sortCriteria[permissionA] - sortCriteria[permissionB];

    if (criteriaComparison === 0) {
      const nameA = (a.user.name || a.user.email || '').toLowerCase();
      const nameB = (b.user.name || b.user.email || '').toLowerCase();
      return nameA.localeCompare(nameB);
    }

    return criteriaComparison;
  });
