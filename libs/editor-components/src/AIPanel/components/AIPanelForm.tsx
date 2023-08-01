import {
  Button,
  InputField,
  Spinner,
  componentCssVars,
  cssVar,
} from '@decipad/ui';
import { css } from '@emotion/react';
import { Send } from 'libs/ui/src/icons';
import { RemoteDataStatus } from '../hooks';

// Used for submit button css too
const spinnerCss = css({
  width: 24,
  height: 24,
  padding: 0,
  background: componentCssVars('AiSendButtonBgColor'),
  marginRight: 8,
  borderRadius: 4,
  display: 'grid',
  placeItems: 'center',
});

const formCss = css({
  marginBottom: 15,
  fieldset: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: cssVar('borderDefault'),
    borderRadius: 8,
    borderStyle: 'solid',
  },
  input: {
    padding: '8px 12px',
    border: 'none',
  },
  button: [
    spinnerCss,
    {
      '&:disabled': {
        color: cssVar('textDisabled'),
        background: 'none',
      },
      svg: {
        width: 16,
      },
    },
  ],
});

type AIPanelFormProps = {
  placeholder?: string;
  handleSubmit: () => void;
  prompt: string;
  setPrompt: (s: string) => void;
  status: RemoteDataStatus;
  disableSubmitButton?: boolean;
};

export const AIPanelForm = ({
  handleSubmit,
  prompt,
  setPrompt,
  placeholder,
  status,
  disableSubmitButton = false,
}: AIPanelFormProps) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      css={formCss}
      contentEditable={false}
    >
      <fieldset disabled={status === 'loading'}>
        <InputField
          type="text"
          placeholder={placeholder}
          value={prompt}
          onChange={(s) => setPrompt(s)}
          autoFocus
        />
        {status === 'loading' ? (
          <div css={spinnerCss}>
            <Spinner />
          </div>
        ) : (
          <Button
            type="text" // prevents handleSubmit being fired twice
            submit={false}
            onClick={() => {
              handleSubmit();
            }}
            disabled={prompt.length === 0 || disableSubmitButton}
          >
            <Send />
          </Button>
        )}
      </fieldset>
    </form>
  );
};
