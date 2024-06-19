import * as Styled from './styles';
import { useDataset, DatasetItemProps } from './hooks';
import { Button } from 'libs/ui/src/shared';
import { ThumbnailCsv } from 'libs/ui/src/icons/thumbnail-icons';

export const DatasetItem: React.FC<DatasetItemProps> = (props) => {
  const [text, description, callback] = useDataset(props);

  return (
    <Styled.Wrapper>
      <Styled.Icon>
        <ThumbnailCsv />
      </Styled.Icon>
      <Styled.Title>
        <p>{text}</p>
        <p>{description}</p>
      </Styled.Title>
      <Styled.Actions>
        <Button type="secondary" onClick={callback}>
          Delete
        </Button>
      </Styled.Actions>
    </Styled.Wrapper>
  );
};
