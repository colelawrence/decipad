import { useResourceUsage } from '@decipad/react-contexts';
import {
  useDeleteExternalDataMutation,
  useRemoveFileFromWorkspaceMutation,
} from '@decipad/graphql-client';
import { ThumbnailChat } from '../../../icons/thumbnail-icons';

import { Dataset } from '@decipad/interfaces';
import { DatasetItem } from '../DatasetItem/DatasetItem';
import * as Styled from './styles';
import { UploadCSV, UploadFromUrl } from '../UploadCSV/UploadCSV';
import { useOnAttachment, useOnImportUrl } from '../UploadCSV/hooks';
import { useState } from 'react';
import { Progress } from '../../../shared/molecules/Progress/Progress';

type DatasetsProps = {
  workspaceId: string;
  datasets: Array<Dataset>;
};

const ONE_KILOBYTE = 1_000;

export const Datasets: React.FC<DatasetsProps> = ({
  workspaceId,
  datasets,
}) => {
  const [, removeExternalData] = useDeleteExternalDataMutation();
  const [, removeAttachment] = useRemoveFileFromWorkspaceMutation();

  const { storage } = useResourceUsage();

  return datasets && datasets.length > 0 ? (
    <Styled.Wrapper>
      <Styled.Header>
        <Styled.Title>
          Connected datasets{' '}
          <Styled.Usage>
            {storage.usage < ONE_KILOBYTE ? '<1kb' : `${storage.usage}mb`} /{' '}
            {storage.quotaLimit}mb used in total
          </Styled.Usage>
        </Styled.Title>

        <UploadUI workspaceId={workspaceId} />
      </Styled.Header>

      {datasets.map((dataset) => (
        <DatasetItem
          key={dataset.dataset.id}
          dataset={dataset}
          incrementUsageBy={storage.incrementUsageBy}
          removeDatasource={(id) => removeExternalData({ id, workspaceId })}
          removeAttachment={(attachmentId) =>
            removeAttachment({ attachmentId })
          }
        />
      ))}
    </Styled.Wrapper>
  ) : (
    <Styled.Placeholder>
      <Styled.PlaceholderIcon>
        <ThumbnailChat />
      </Styled.PlaceholderIcon>
      <Styled.HelperTitle>No active datasets</Styled.HelperTitle>
      <Styled.HelperText>
        When you add a new dataset it will show up here
      </Styled.HelperText>

      <UploadUI workspaceId={workspaceId} />
    </Styled.Placeholder>
  );
};
const UploadUI: React.FC<{
  workspaceId: string;
}> = ({ workspaceId }) => {
  const { onAttachment, progress } = useOnAttachment({
    workspaceId,
    afterUpload: () => {},
  });

  const { onImportUrl } = useOnImportUrl({
    workspaceId,
    afterUpload: () => {},
  });
  const [isFromUrlOpen, setFromUrlOpen] = useState(false);
  if (progress) {
    return (
      <Styled.UploadProgressWrapper>
        <Progress progress={progress} />
      </Styled.UploadProgressWrapper>
    );
  }

  if (isFromUrlOpen) {
    return (
      <UploadFromUrl
        onBlur={() => setFromUrlOpen(false)}
        onImportUrl={onImportUrl}
      />
    );
  }

  return (
    <UploadCSV
      onAttachment={onAttachment}
      onOpenUrlImport={() => setFromUrlOpen(true)}
    />
  );
};
