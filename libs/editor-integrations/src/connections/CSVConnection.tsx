import { type FC } from 'react';
import styled from '@emotion/styled';
import { UpgradeWarningBlock } from '@decipad/editor-components';
import { type ConnectionProps } from './types';
import { UploadCSV, OptionsList } from '@decipad/ui';
import { CSVRunner } from '../runners';
import { assertInstanceOf } from '@decipad/utils';
import { Loading } from './shared';
import { useWorkspaceDatasets } from '../hooks/useWorkspaceDatasets';

const Wrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const getDatasetNameAndId = (
  dataset: ReturnType<typeof useWorkspaceDatasets>[number]
): { id: string; name: string } => {
  switch (dataset.type) {
    case 'attachment':
      return { id: dataset.dataset.url, name: dataset.dataset.fileName };
    case 'data-source':
      return {
        id: dataset.dataset.externalId!,
        name: dataset.dataset.externalId!,
      };
  }
};

export const CSVConnection: FC<ConnectionProps> = ({
  runner,
  workspaceId,
  onRun,
}) => {
  assertInstanceOf(runner, CSVRunner);

  const workspaceDatasets = useWorkspaceDatasets(workspaceId);
  const selections = workspaceDatasets.map(getDatasetNameAndId);

  return (
    <Wrapper>
      <OptionsList
        name={runner.getResourceName() ?? 'Select CSV'}
        label="Select CSV"
        disabled={workspaceDatasets.length === 0}
        selections={selections}
        onSelect={(selection) => {
          runner.setUrl(selection.id);
          runner.setResourceName(selection.name);
          onRun();
        }}
      />

      <UploadCSV
        workspaceId={workspaceId}
        afterUpload={(url) => {
          runner.setUrl(url);
          onRun();
        }}
      />

      <Loading />

      <UpgradeWarningBlock
        type="storage"
        variant="block"
        workspaceId={workspaceId}
        noun="MBs"
      />
    </Wrapper>
  );
};
