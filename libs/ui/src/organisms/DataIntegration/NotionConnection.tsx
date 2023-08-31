import styled from '@emotion/styled';
import { InputField } from '../../atoms';
import { FC } from 'react';
import { p14Bold } from '../../primitives';

interface NotionConnectionProps {
  readonly notionUrl: string;
  readonly setNotionUrl: (notionUrl: string) => void;

  readonly status?: string;
}

export const NotionConnection: FC<NotionConnectionProps> = ({
  notionUrl,
  setNotionUrl,
  status,
}) => {
  return (
    <Wrapper>
      <InputField
        label="Database Link"
        value={notionUrl}
        onChange={setNotionUrl}
      />
      {status && <span>{status}</span>}
    </Wrapper>
  );
};

const Wrapper = styled.div({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  span: {
    ...p14Bold,
    marginTop: 'auto',
  },
});
