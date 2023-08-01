import { css } from '@emotion/react';
import { cssVar } from '../primitives/index';

export const plateButtonCss = css`
  display: inline-flex;
  position: relative;
  text-align: center;
  justify-content: center;
  align-items: center;
  max-width: 100%;

  font-weight: 500;
  border-width: 0;
  cursor: pointer;

  background-color: ${cssVar('backgroundMain')};

  :hover {
    background-color: ${cssVar('backgroundDefault')};
  }

  :hover {
    background-color: ${cssVar('backgroundHeavy')};
  }

  padding: 4px 10px;

  font-family: inherit;
  font-size: 14px;
  border-radius: 3px;

  color: inherit;

  :active {
    color: inherit;
  }

  :visited {
    color: inherit;
  }
`;

export const floatingRootCss = css`
  background-color: ${cssVar('backgroundMain')};
  width: auto;
  z-index: 10;

  border-radius: 4px;
`;

export const floatingRowCss = css`
  display: flex;
  padding: 4px 8px;
  flex-direction: row;
  align-items: center;
`;

export const floatingButtonCss = css([
  plateButtonCss,
  css`
    padding: 0 4px;
  `,
]);

export const floatingInputCss = css`
  padding: 0;
  background-color: transparent;
  flex-grow: 1;
  height: 2rem;
  border-style: none;

  :focus {
    outline: none;
  }

  line-height: 20px;
`;
