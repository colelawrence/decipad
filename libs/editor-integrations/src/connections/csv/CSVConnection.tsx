import { useCallback, useState } from 'react';
import type { FC } from 'react';
import styled from '@emotion/styled';
import { UpgradeWarningBlock } from '@decipad/editor-components';
import type { ConnectionProps } from '../types';
import { UploadCSV, OptionsList, Progress, UploadFromUrl } from '@decipad/ui';
import { assertInstanceOf } from '@decipad/utils';
import { Loading } from '../shared';
import { useWorkspaceDatasets } from '../../hooks/useWorkspaceDatasets';
import { CSVRunner } from '@decipad/notebook-tabs';
import { labelStyle } from 'libs/ui/src/shared/atoms/Input/Input';
import {
  useOnAttachment,
  useOnImportUrl,
} from 'libs/ui/src/modules/integrations/UploadCSV/hooks';
import * as UploadStyled from 'libs/ui/src/modules/integrations/UploadCSV/styles';

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

  const afterUpload = useCallback(
    (url: string) => {
      runner.setOptions({ runner: { csvUrl: url } });
      onRun();
    },
    [runner, onRun]
  );

  const { onAttachment, progress } = useOnAttachment({
    workspaceId,
    afterUpload,
  });

  const { onImportUrl } = useOnImportUrl({ workspaceId, afterUpload });

  const [isFromUrlOpen, setFromUrlOpen] = useState(false);

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
          onOpenUrlImport={() => {
            setFromUrlOpen(true);
          }}
          onAttachment={onAttachment}
          type="secondary"
          text="+"
        />
      </Wrapper>

      {progress ? (
        <UploadStyled.UploadProgressWrapper>
          <Progress progress={progress} />
        </UploadStyled.UploadProgressWrapper>
      ) : (
        isFromUrlOpen && (
          <UploadFromUrl
            onBlur={() => {
              setFromUrlOpen(false);
            }}
            onImportUrl={onImportUrl}
          />
        )
      )}

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
