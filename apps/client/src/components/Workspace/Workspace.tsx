import React, { useContext, useState, useEffect } from 'react';
import { DeciRuntimeContext } from '@decipad/editor';

import { Frame } from '../Frame/Frame';
import { DimmedMessage } from '../DimmedMessage/DimmedMessage';
import { Item } from './Item/Item';

export const Workspace = ({ workspaceId }: { workspaceId?: string }) => {
  const { runtime } = useContext(DeciRuntimeContext);
  const [_loading, setLoading] = useState(false);
  const [padIds, setPadIds] = useState([]);
  useEffect(() => {
    if (workspaceId) {
      const sub = runtime
        .workspace(workspaceId)
        .pads.list()
        .subscribe(({ loading, data: padIds }) => {
          setLoading(loading);
          setPadIds(padIds);
        });

      return () => sub.unsubscribe();
    }
  }, [runtime, workspaceId]);

  return (
    <Frame>
      {padIds?.length > 0 ? (
        padIds.map((padId) => (
          <Item key={padId} id={padId} workspaceId={workspaceId} />
        ))
      ) : (
        <DimmedMessage
          headline="Such empty"
          text="You should create new notebooks!"
        />
      )}
    </Frame>
  );
};
