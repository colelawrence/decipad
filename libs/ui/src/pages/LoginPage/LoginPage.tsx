import { css } from '@emotion/react';
import { FC, useRef, useState } from 'react';
import { AuthInput, Button } from '../../atoms';
import { AuthContent } from '../../molecules';

const wrapperStyles = css({
  height: '100%',
  display: 'grid',
  justifyContent: 'center',
  justifyItems: 'center',
  alignContent: 'center',
});

export interface LoginPageProps {
  onSubmit: (email: string) => void;
}

export const LoginPage = ({ onSubmit }: LoginPageProps): ReturnType<FC> => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formValid, setFormValid] = useState(false);
  const [email, setEmail] = useState('');

  const onChangeEmail = (newEmail: string) => {
    setEmail(newEmail);

    // ref must be set here
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    setFormValid(formRef.current!.checkValidity());
  };

  return (
    <div css={wrapperStyles}>
      <AuthContent
        title="Log in to Decipad"
        description="A new way to make sense of numbers"
      />
      <form
        ref={formRef}
        css={{
          display: 'grid',
          minWidth: '374px',
          padding: '24px 0',
          gridGap: '12px',
        }}
      >
        <AuthInput
          placeholder="Your Email"
          type="email"
          required
          value={email}
          onChange={onChangeEmail}
        />
        <Button
          submit
          size="extraLarge"
          disabled={!formValid}
          onClick={() => onSubmit(email)}
        >
          Continue
        </Button>
      </form>
    </div>
  );
};
