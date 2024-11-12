import {
  DataTabWorkspaceResultElement,
  ELEMENT_DATA_TAB_WORKSPACE_RESULT,
} from '@decipad/editor-types';
import { WorkspaceNumber as GraphqlWorkspaceNumber } from '@decipad/graphql-client';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import { EditorController } from '@decipad/notebook-tabs';
import { useResolved } from '@decipad/react-utils';
import { DATA_TAB_INDEX } from 'libs/notebook-tabs/src/constants';
import { nanoid } from 'nanoid';
import { FC, MouseEventHandler, useMemo } from 'react';
import { WorkspaceNumbersWrapper } from './styles';
import { decodeResult, decoders } from '@decipad/remote-computer-codec';
import { NumberCatalogItemStyled } from 'libs/ui/src/modules/sidebar/NumberCatalog/NumberCatalogItem';
import { Result } from '@decipad/language-interfaces';
import { ShowMore } from 'libs/ui/src/icons';
import { NavigationList } from 'libs/ui/src/modules/workspace/NavigationList/NavigationList';
import { ItemAnchor } from 'libs/ui/src/modules/workspace/NavigationItem/styles';
import { groupHeadingStyles } from '@decipad/ui';
import { useToast } from '@decipad/toast';
import { useComputer } from '@decipad/editor-hooks';

type WorkspaceNumberProps = GraphqlWorkspaceNumber & {
  controller: EditorController;
};

type WorkspaceNumbersProps = {
  controller: EditorController;
  workspaceNumbers: Array<GraphqlWorkspaceNumber>;
};

const encodingToFormattedString = (
  encoding: string
): Promise<Result.Result> => {
  const buffer = Buffer.from(encoding, 'base64');
  const dataView = new DataView(buffer.buffer);
  return decodeResult(dataView, 0, decoders).then(([result]) => result);
};

const WorkspaceNumber: FC<WorkspaceNumberProps> = ({
  controller,
  id,
  name,
  encoding,
}) => {
  const toast = useToast();
  const computer = useComputer();

  const setWorkspaceNumber = useNotebookWithIdState((s) => () => {
    s.setWorkspaceNumber(id);
  });

  const onUseNumber: MouseEventHandler = (e): void => {
    e.preventDefault();
    e.stopPropagation();

    const doesVariableNameExist = computer.getVarBlockId(name) != null;

    if (doesVariableNameExist) {
      toast.warning(
        'A variable with this name already exists in the notebook.'
      );
      return;
    }

    controller.apply({
      type: 'insert_node',
      node: {
        id: nanoid(),
        type: ELEMENT_DATA_TAB_WORKSPACE_RESULT,
        workspaceResultId: id,
        children: [{ text: '' }],
      } satisfies DataTabWorkspaceResultElement,
      path: [DATA_TAB_INDEX, 0],
    });
  };

  const result = useResolved(
    useMemo(() => encodingToFormattedString(encoding), [encoding])
  );

  if (result == null) {
    return null;
  }

  return (
    <ItemAnchor href="#" onClick={setWorkspaceNumber} level={0}>
      <NumberCatalogItemStyled variant="static" variableName={name}>
        <ShowMore onClick={onUseNumber} />
      </NumberCatalogItemStyled>
    </ItemAnchor>
  );
};

export const WorkspaceNumbers: FC<WorkspaceNumbersProps> = ({
  controller,
  workspaceNumbers,
}) => {
  if (workspaceNumbers.length === 0) {
    return null;
  }

  return (
    <WorkspaceNumbersWrapper>
      <p css={groupHeadingStyles}>Workspace Data</p>
      <NavigationList>
        {workspaceNumbers.map((props) => (
          <WorkspaceNumber {...props} controller={controller} />
        ))}
      </NavigationList>
    </WorkspaceNumbersWrapper>
  );
};
