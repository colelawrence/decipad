import { useResourceUsage } from '@decipad/react-contexts';
import {
  useDeleteExternalDataMutation,
  useRemoveFileFromWorkspaceMutation,
} from '@decipad/graphql-client';
import { ThumbnailChat } from '../../../icons/thumbnail-icons';

import { Dataset } from '@decipad/interfaces';
import { DatasetItem } from '../DatasetItem/DatasetItem';
import * as Styled from './styles';
import { UploadCSV } from '../UploadCSV/UploadCSV';

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

        <UploadCSV workspaceId={workspaceId} />
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
      <UploadCSV workspaceId={workspaceId} />
    </Styled.Placeholder>
  );
};
