import type { FC } from 'react';
import styled from '@emotion/styled';
import { UpgradeWarningBlock } from '@decipad/editor-components';
import type { ConnectionProps } from '../types';
import { UploadCSV, OptionsList } from '@decipad/ui';
import { assertInstanceOf } from '@decipad/utils';
import { Loading } from '../shared';
import { useWorkspaceDatasets } from '../../hooks/useWorkspaceDatasets';
import { CSVRunner } from '@decipad/notebook-tabs';
import { labelStyle } from 'libs/ui/src/shared/atoms/Input/Input';

const Wrapper = styled.section({
  display: 'flex',
  gap: '4px',
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
  info,
  onRun,
}) => {
  assertInstanceOf(runner, CSVRunner);

  const workspaceDatasets = useWorkspaceDatasets(workspaceId);
  const selections = workspaceDatasets.map(getDatasetNameAndId);

  return (
    <>
      <label css={labelStyle}>Select or upload CSV</label>
      <Wrapper>
        <OptionsList
          name={runner.resourceName ?? 'Select CSV'}
          label="Select CSV"
          disabled={workspaceDatasets.length === 0}
          selections={selections}
          onSelect={(selection) => {
            runner.setOptions({ runner: { csvUrl: selection.id } });
            runner.setResourceName(selection.name);
            onRun();
          }}
        />

        <UploadCSV
          workspaceId={workspaceId}
          afterUpload={(url) => {
            runner.setOptions({ runner: { csvUrl: url } });
            onRun();
          }}
          type="secondary"
          text="+"
        />
      </Wrapper>

      <Loading info={info} />

      <UpgradeWarningBlock
        type="storage"
        variant="block"
        workspaceId={workspaceId}
        noun="MBs"
      />
    </>
  );
};
