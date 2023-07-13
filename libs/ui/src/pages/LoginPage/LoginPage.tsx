import { FC, useRef, useState } from 'react';
import { css } from '@emotion/react';
import { Button, InputField } from '../../atoms';
import { AuthContent, SignUpConditionsContent } from '../../molecules';
import { LoginBox } from '../../organisms/LoginBox/LoginBox';

const formStyle = css({
  justifySelf: 'stretch',

  display: 'grid',
  gridGap: '16px',
});

const LoginForm = ({ onSubmit }: LoginPageProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formValid, setFormValid] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChangeEmail = (newEmail: string) => {
    setEmail(newEmail);

    // ref must be set here
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    setFormValid(formRef.current!.checkValidity());
  };

  return (
    <>
      <form
        ref={formRef}
        css={formStyle}
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);
          try {
            await onSubmit(email);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <InputField
          autoFocus
          size="small"
          placeholder="Enter your email"
          type="email"
          required
          value={email}
          onChange={onChangeEmail}
        />
        <Button submit type="primary" disabled={!formValid || isSubmitting}>
          {isSubmitting ? 'Please wait...' : 'Continue with email'}
        </Button>
      </form>
      <SignUpConditionsContent />
    </>
  );
};

export interface LoginPageProps {
  onSubmit: (email: string) => void | Promise<void>;
}

export const LoginPage = ({ onSubmit }: LoginPageProps): ReturnType<FC> => {
  return (
    <LoginBox>
      <AuthContent title="Welcome to Decipad" />
      <LoginForm onSubmit={onSubmit} />
    </LoginBox>
  );
};
