import { css } from '@emotion/react';
import { FC, useRef, useState } from 'react';
import { InputField, Button } from '../../atoms';
import { AuthContent, SignUpContent } from '../../molecules';

const wrapperStyles = css({
  display: 'grid',
  gridTemplateColumns: 'min(374px, 100%)',

  justifyContent: 'center',
  justifyItems: 'center',
  alignContent: 'center',
});

export interface LoginPageProps {
  onSubmit: (email: string) => void | Promise<void>;
}

export const LoginPage = ({ onSubmit }: LoginPageProps): ReturnType<FC> => {
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
    <div css={wrapperStyles}>
      <AuthContent
        title="Log in to Decipad"
        description="A new way to make sense of numbers"
      />
      <form
        ref={formRef}
        css={{
          justifySelf: 'stretch',
          padding: '24px 8px',
          paddingBottom: '8px',

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
        <Button
          type="primaryBrand"
          size="extraLarge"
          disabled={!formValid || isSubmitting}
        >
          Continue
        </Button>
      </form>
      <SignUpContent />
    </div>
  );
};
