import { pushResultToComputer } from '@decipad/computer-utils';
import { useComputer } from '@decipad/editor-hooks';
import { DataTabWorkspaceResultElement } from '@decipad/editor-types';
import { useGetNotebookByIdQuery } from '@decipad/graphql-client';
import { decodeResult, decoders } from '@decipad/remote-computer-codec';
import { useNotebookRoute } from '@decipad/routing';
import { assert } from '@decipad/utils';
import { FC, ReactNode, useEffect } from 'react';

type WorkspaceNumberProps = {
  workspaceNumberElement: DataTabWorkspaceResultElement;
  children: ReactNode;
};

const useWorkspaceNumber = ({
  workspaceNumberElement,
}: WorkspaceNumberProps): void => {
  const { notebookId } = useNotebookRoute();
  const [{ data }] = useGetNotebookByIdQuery({ variables: { id: notebookId } });

  const workspaceNumbers = data?.getPadById?.workspace?.workspaceNumbers;

  const computer = useComputer();

  useEffect(() => {
    if (workspaceNumbers == null) {
      return;
    }

    const myWorkspaceNumber = workspaceNumbers.find(
      (graphqlWorkspaceNumber) =>
        graphqlWorkspaceNumber.id === workspaceNumberElement.workspaceResultId
    );

    // This can actually happen if you delete a workspace number.
    // So we need some mutations to happen to the document
    // BIG TODO.
    assert(
      myWorkspaceNumber != null,
      'Graphql Workspace number and notebook workspace number are out of sync.'
    );

    const dataView = new DataView(
      Buffer.from(myWorkspaceNumber.encoding, 'base64').buffer
    );

    decodeResult(dataView, 0, decoders).then(([result]) => {
      pushResultToComputer(
        computer,
        workspaceNumberElement.id,
        myWorkspaceNumber.name,
        result
      );
    });

    return () => {
      pushResultToComputer(
        computer,
        workspaceNumberElement.id,
        myWorkspaceNumber.name,
        undefined
      );
    };
  }, [computer, workspaceNumbers, workspaceNumberElement]);
};

export const WorkspaceNumber: FC<WorkspaceNumberProps> = (props) => {
  useWorkspaceNumber(props);

  return <div data-slate-node="element" />;
};
