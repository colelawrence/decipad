import { css } from '@emotion/react';
import { Meta } from '@storybook/react';
import * as textExports from './text';
import {
  banner,
  code,
  display,
  h1,
  h2,
  p10Regular,
  p10Medium,
  p12Medium,
  p12Regular,
  p13Medium,
  p13Regular,
  p14Medium,
  p14Regular,
  p15Medium,
  p15Regular,
  p16Regular,
  p18Regular,
  p20Medium,
  p24Medium,
  p32Medium,
  p8Regular,
  p8Medium,
} from './text';
// eslint-disable-next-line import/no-self-import
import * as storyExports from './text.stories';

export default {
  title: 'Primitives / Text',
  argTypes: {
    children: {
      control: 'text',
      defaultValue: 'Text',
    },
  },
} as Meta;

export const Banner: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <h1 css={css(banner)}>{children}</h1>;
export const Display: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <h1 css={css(display)}>{children}</h1>;
export const H1: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <h1 css={css(h1)}>{children}</h1>;
export const H2: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <h2 css={css(h2)}>{children}</h2>;

export const P12Regular: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(p12Regular)}>{children}</p>;
export const P8Regular: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(p8Regular)}>{children}</p>;
export const P8Medium: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(p8Medium)}>{children}</p>;
export const P10Regular: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(p10Regular)}>{children}</p>;
export const P10Medium: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(p10Medium)}>{children}</p>;
export const P12Medium: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(p12Medium)}>{children}</p>;
export const P13Regular: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(p13Regular)}>{children}</p>;
export const P13Medium: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(p13Medium)}>{children}</p>;
export const P14Regular: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(p14Regular)}>{children}</p>;
export const P14Medium: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(p14Medium)}>{children}</p>;
export const P15Regular: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(p15Regular)}>{children}</p>;
export const P15Medium: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(p15Medium)}>{children}</p>;
export const P16Regular: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(p16Regular)}>{children}</p>;
export const P16Bold: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(p16Regular)}>{children}</p>;
export const P18Regular: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(p18Regular)}>{children}</p>;
export const P20Medium: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(p20Medium)}>{children}</p>;
export const P24Bold: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(p24Medium)}>{children}</p>;
export const P32Medium: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(p32Medium)}>{children}</p>;

export const Code: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <p css={css(code)}>{children}</p>;

// make sure all types of text are covered by stories
if (
  Object.keys(storyExports).filter((name) => name !== 'default').length !==
  Object.keys(textExports).filter((name) => name !== 'GlobalTextStyles').length
)
  console.error(
    'Not all text styles covered by stories! Text style exports:',
    Object.keys(textExports)
  );
