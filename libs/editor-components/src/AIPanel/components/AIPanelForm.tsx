import { Button, InputField, cssVar, grey300, setCssVar } from '@decipad/ui';
import { css } from '@emotion/react';
import { Send } from 'libs/ui/src/icons';

const formCss = css({
  marginBottom: 15,
  fieldset: {
    display: 'flex',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: grey300.rgb,
    borderRadius: 8,
    borderStyle: 'solid',
  },
  input: {
    padding: '8px 12px',
    border: 'none',
  },
  button: {
    ...setCssVar('currentTextColor', cssVar('aiSendButtonColor')),
    svg: {
      width: 16,
    },
  },
});

type AIPanelFormProps = {
  placeholder?: string;
  handleSubmit: () => void;
  prompt: string;
  setPrompt: (s: string) => void;
  disabled: boolean;
};

export const AIPanelForm = ({
  handleSubmit,
  prompt,
  setPrompt,
  disabled,
  placeholder,
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
      <fieldset disabled={disabled}>
        <InputField
          type="text"
          placeholder={placeholder}
          value={prompt}
          onChange={(s) => setPrompt(s)}
          autoFocus
        />
        <Button
          type="text" // prevents handleSubmit being fired twice
          submit={false}
          onClick={() => {
            handleSubmit();
          }}
        >
          <Send />
        </Button>
      </fieldset>
    </form>
  );
};
