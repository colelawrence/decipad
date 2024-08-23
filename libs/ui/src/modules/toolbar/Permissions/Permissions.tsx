import {
  useGetNotebookByIdQuery,
  useUnsafePermissionsMutation,
} from '@decipad/graphql-client';
import { useNotebookRoute } from '@decipad/routing';
import * as Popover from '@radix-ui/react-popover';
import { Toggle } from '../../../shared';
import * as Styled from '../styles';

export const Permissions = () => {
  const [, unsafePermissions] = useUnsafePermissionsMutation();
  const { notebookId } = useNotebookRoute();
  const [data] = useGetNotebookByIdQuery({ variables: { id: notebookId } });

  const permissionType = data.data?.getPadById?.myPermissionType;
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Styled.Trigger>Permissions</Styled.Trigger>
      </Popover.Trigger>
      <Popover.Content asChild align="end" sideOffset={16}>
        <Styled.Wrapper>
          {['Read', 'Write', 'Admin', 'Incognito'].map((permission) => (
            <Styled.ToggleLabel key={permission}>
              <Toggle
                variant="checkbox"
                active={
                  (permission === 'Incognito' && permissionType == null) ||
                  permission.toUpperCase() === permissionType
                }
                ariaRoleDescription={`Toggle ${permission}`}
                onChange={(value) => {
                  if (!value) return;
                  switch (permission) {
                    case 'Read':
                      unsafePermissions({
                        id: notebookId,
                        permissionType: 'READ',
                        resourceType: 'PAD',
                      });
                      break;
                    case 'Write':
                      unsafePermissions({
                        id: notebookId,
                        permissionType: 'WRITE',
                        resourceType: 'PAD',
                      });
                      break;
                    case 'Admin':
                      unsafePermissions({
                        id: notebookId,
                        permissionType: 'ADMIN',
                        resourceType: 'PAD',
                      });
                      break;
                    case 'Incognito':
                      unsafePermissions({
                        id: notebookId,
                        permissionType: null,
                        resourceType: 'PAD',
                      });
                      break;
                  }
                }}
              />
              {permission}
            </Styled.ToggleLabel>
          ))}
        </Styled.Wrapper>
      </Popover.Content>
    </Popover.Root>
  );
};
