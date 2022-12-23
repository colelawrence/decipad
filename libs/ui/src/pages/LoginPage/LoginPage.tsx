import { css } from '@emotion/react';
import { FC, useCallback, useRef, useState } from 'react';
import { Button, InputField } from '../../atoms';
import {
  AuthContent,
  SignUpConditionsContent,
  SignUpContent,
} from '../../molecules';
import { cssVar } from '../../primitives';

const outerBorderStyles = css({
  border: `1px solid ${cssVar('borderColor')}`,
  boxShadow: `0px 2px 16px ${cssVar('highlightColor')}`,
  borderRadius: '8px',
});

const outerWrapperStyles = css({
  display: 'grid',
  justifyItems: 'center',
  alignContent: 'center',

  padding: '16px',
});

const wrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '440px',

  gridGap: '12px',

  padding: '24px 12px',
});

const actionWrapperStyles = css({
  marginTop: '10px',
  display: 'grid',
  width: '100%',
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
        css={{
          justifySelf: 'stretch',

          display: 'grid',
          gridGap: '12px',
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
          placeholder="Your Email"
          type="email"
          required
          value={email}
          onChange={onChangeEmail}
        />
        <Button submit disabled={!formValid || isSubmitting}>
          {isSubmitting ? 'Please wait...' : 'Submit'}
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
  const [usingEmail, setUsingEmail] = useState(false);

  const continueWithEmail = useCallback(() => setUsingEmail(true), []);

  return (
    <div css={outerWrapperStyles}>
      <div css={[wrapperStyles, outerBorderStyles]}>
        <AuthContent
          title={
            usingEmail ? 'Continue with an email link' : 'Log in to Decipad'
          }
          description={
            usingEmail
              ? 'Enter your email and we will send you a link'
              : 'A new way to make sense of numbers'
          }
        />
        {usingEmail ? (
          <LoginForm onSubmit={onSubmit} />
        ) : (
          <div css={actionWrapperStyles}>
            <Button onClick={continueWithEmail}>Continue with email</Button>
            <SignUpContent />
          </div>
        )}
      </div>
    </div>
  );
};
