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

  background-color: ${cssVar('backgroundColor')};

  :hover {
    background-color: ${cssVar('highlightColor')};
  }

  :hover {
    background-color: ${cssVar('strongHighlightColor')};
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
  background-color: ${cssVar('backgroundColor')};
  width: auto;
  z-index: 10;

  border-radius: 4px;
  box-shadow: rgb(15 15 15 / 5%) 0 0 0 1px, rgb(15 15 15 / 10%) 0 3px 6px,
    rgb(15 15 15 / 20%) 0 9px 24px;
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
