import { OpenAI } from '../../icons';
import { Anchor } from '../../utils';
import * as Styled from './styles';

const DECIPAD_GPT_LINK =
  'https://chat.openai.com/g/g-7VQTmaCwf-decipad-notebook-modeling-companion';

export const GeneratedByAi: React.FC = () => (
  <Anchor href={DECIPAD_GPT_LINK}>
    <Styled.GPTAuthorContainer>
      <p>Created using Decipad GPT</p>
      <Styled.GPTIcon>
        <OpenAI />
      </Styled.GPTIcon>
    </Styled.GPTAuthorContainer>
  </Anchor>
);
