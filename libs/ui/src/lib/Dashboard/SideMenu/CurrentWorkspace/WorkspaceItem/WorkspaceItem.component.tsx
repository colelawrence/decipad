import { Image } from '@chakra-ui/image';
import { MenuItem } from '@chakra-ui/menu';
import React, { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';

export const WorkspaceItem = ({
  workspaceId,
  runtime,
}: {
  workspaceId: string;
  runtime: any;
}) => {
  const [workspace, setWorkspace] =
    useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    let sub: Subscription;

    if (runtime) {
      sub = runtime.workspaces.get(workspaceId).subscribe(({ data }: any) => {
        setWorkspace(data);
      });
    }

    return () => sub.unsubscribe();
  }, [workspaceId, runtime]);

  if (!workspace) return null;

  return (
    <MenuItem
      key={workspace.id}
      icon={
        <Image
          src="http://placekitten.com/20/20"
          borderRadius="5"
          alt="option"
        />
      }
    >
      {workspace.name}
    </MenuItem>
  );
};
