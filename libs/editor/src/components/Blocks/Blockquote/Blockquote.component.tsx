import styled from '@emotion/styled';
import { SlatePluginComponent } from '@udecode/slate-plugins';

const Element = styled('div')({
  color: 'rgba(0,0,0,0.5)',
  lineHeight: '1.75',
  borderLeft: '5px solid #332942',
  padding: '6px 24px',
  fontStyle: 'italic',
  fontSize: '16px',
  boxShadow: '0px 2px 24px -4px rgba(36, 36, 41, 0.06)',
  '& ::selection': {
    backgroundColor: 'rgba(196, 202, 251, 0.5)',
  },
});

export const Blockquote: SlatePluginComponent = ({ attributes, children }) => {
  return <Element {...attributes}>{children}</Element>;
};
