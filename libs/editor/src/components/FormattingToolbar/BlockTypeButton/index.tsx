import styled from '@emotion/styled';
import {
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_PARAGRAPH,
  getSlatePluginType,
  ToolbarElement,
  useEventEditorId,
  useStoreEditorRef,
} from '@udecode/slate-plugins';
import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const Wrapper = styled('div')({
  position: 'relative',
});

const Button = styled('button')({
  border: 'none',
  backgroundColor: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 20px',
  width: '125px',
  height: '40px',
  borderRadius: '3px',
  transition: 'background-color 0.2s ease-out',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#f0f0f2',
  },
});

const OptionsWrapper = styled('div')<{ active: boolean }>(
  {
    position: 'absolute',
    top: '50px',
    left: '0px',
    width: '150px',
    padding: '8px',
    borderRadius: '6px',
    backgroundColor: '#fff',
    boxShadow: '0px 2px 24px -4px rgba(36, 36, 41, 0.06)',
    border: '1px solid #f0f0f2',
  },
  (props) => ({
    display: props.active ? 'block' : 'none',
  })
);

const IconWrapper = styled('span')({
  height: '100%',
  display: 'flex',
  alignItems: 'center',
});

const OptionWrapper = styled('div')({
  display: 'flex',
  gap: '0.5rem',
  width: '100%',
  alignItems: 'center',
});

const OptionIcon = styled('div')({
  width: '24px',
  height: '24px',
  backgroundColor: '#f0f0f2',
  borderRadius: '3px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
});

const OptionsLabel = styled('span')({
  fontSize: '14px',
});

export const BlockTypeButton = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));
  const [active, setActive] = useState(false);
  return (
    <Wrapper>
      <Button
        onClick={() => setActive((prev) => !prev)}
        onBlur={() => setActive(false)}
      >
        <span>Text size</span>
        <IconWrapper>
          <FiChevronDown />
        </IconWrapper>
      </Button>
      <OptionsWrapper active={active}>
        <OptionsLabel>Turn into:</OptionsLabel>
        <ToolbarElement
          type={getSlatePluginType(editor, ELEMENT_H2)}
          styles={{ root: { width: '100%', marginTop: '1rem', color: '#111' } }}
          icon={
            <OptionWrapper>
              <OptionIcon>
                <p>Aa</p>
              </OptionIcon>
              <p style={{ fontWeight: 'bold' }}>Subtitle</p>
            </OptionWrapper>
          }
        />
        <ToolbarElement
          type={getSlatePluginType(editor, ELEMENT_H3)}
          styles={{ root: { width: '100%', marginTop: '1rem', color: '#111' } }}
          icon={
            <OptionWrapper>
              <OptionIcon>
                <p>Aa</p>
              </OptionIcon>
              <p style={{ fontWeight: 'bold' }}>Subheading</p>
            </OptionWrapper>
          }
        />
        <ToolbarElement
          type={getSlatePluginType(editor, ELEMENT_PARAGRAPH)}
          styles={{ root: { width: '100%', marginTop: '1rem', color: '#111' } }}
          icon={
            <OptionWrapper>
              <OptionIcon>
                <p>Aa</p>
              </OptionIcon>
              <p style={{ fontWeight: 'bold' }}>Paragraph</p>
            </OptionWrapper>
          }
        />
      </OptionsWrapper>
    </Wrapper>
  );
};
