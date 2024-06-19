import { Dataset } from '@decipad/interfaces';

export type DatasetItemProps = Readonly<{
  dataset: Dataset;
  incrementUsageBy: (_: number) => void;
  removeAttachment: (_: string) => void;
  removeDatasource: (_: string) => void;
}>;

const ONE_MEGABYTE = 1_000_000;
const ONE_KILOBYTE = 1_000;

const calculateSize = (size: number) => {
  if (size < ONE_MEGABYTE) {
    return `${(size / ONE_KILOBYTE).toFixed(2)}KB`;
  }
  return `${(size / ONE_MEGABYTE).toFixed(2)}MB`;
};

export const useDataset = ({
  dataset,
  incrementUsageBy,
  removeAttachment,
  removeDatasource,
}: DatasetItemProps): [string, string, () => void] => {
  switch (dataset.type) {
    case 'attachment':
      return [
        dataset.dataset.fileName,
        calculateSize(dataset.dataset.fileSize),
        () => {
          incrementUsageBy(-(dataset.dataset.fileSize / ONE_MEGABYTE));
          removeAttachment(dataset.dataset.id);
        },
      ];
    case 'data-source':
      return [
        dataset.dataset.name,
        'Imported from URL',
        () => {
          removeDatasource(dataset.dataset.id);
        },
      ];
    default:
      return ['', '', () => {}];
  }
};
