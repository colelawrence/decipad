/* eslint decipad/css-prop-named-variable: 0 */
import { FC, useRef, useState } from 'react';
import { Button, InputField } from '../../atoms';
import { AuthContent, SignUpConditionsContent } from '../../molecules';
import { LoginBox } from '../../organisms/LoginBox/LoginBox';

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
        css={{
          justifySelf: 'stretch',

          display: 'grid',
          gridGap: '16px',
        }}
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
          small
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
