import styled from '@emotion/styled';
import { PlatePluginComponent } from '@udecode/plate';

const Span = styled('span')({
  backgroundColor: '#DFFAE9',
  border: '1px solid #B3E5C6',
  padding: '6px 12px',
  margin: '6px 0',
  cursor: 'pointer',
  borderRadius: '50px',
});

export const Bubble: PlatePluginComponent = ({ attributes, children }) => {
  return (
    <Span {...attributes} onClick={() => console.log('clicked')}>
      {children}
    </Span>
  );
};
