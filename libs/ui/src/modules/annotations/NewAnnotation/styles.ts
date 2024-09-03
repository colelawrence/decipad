import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { cssVar, p14Medium } from 'libs/ui/src/primitives';

type WrapperProps = {
  extendedView: boolean;
};

export const Wrapper = styled(motion.form)<WrapperProps>(({ extendedView }) => [
  {
    display: 'grid',
    borderRadius: '6px',
    backgroundColor: cssVar('backgroundMain'),
    gridTemplateColumns: extendedView ? 'auto 20px' : '28px auto 20px',
    alignItems: 'end',
    gridTemplateAreas: extendedView
      ? '"input input" "void submit"'
      : '"void input submit"',
    position: 'sticky',
    margin: '-12px',
    padding: '12px',
    bottom: '-12px',
  },
]);

export const Textarea = styled.textarea(p14Medium, {
  gridArea: 'input',
  zIndex: 1,
  lineHeight: '20px',
  padding: 0,
  border: 'none',
  outline: 'none',
  resize: 'none',
  color: cssVar('textHeavy'),
  backgroundColor: 'transparent',

  '&::placeholder': {
    color: cssVar('textDisabled'),
  },
});

export const SubmitButton = styled.button({
  height: 20,
  width: 20,
  gridArea: 'submit',
  color: cssVar('textDefault'),
  display: 'grid',

  '&:hover': {
    color: cssVar('textHeavy'),
  },

  '&:disabled': {
    color: cssVar('textDisabled'),
  },

  '& > svg': {
    height: '100%',
    width: '100%',
  },
});
