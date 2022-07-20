import styled from '@emotion/styled';
import { css } from '@emotion/react';
import {
  FloatingLink as PlateFloatingLink,
  LinkIcon,
  plateButtonCss,
  ShortTextIcon,
  useFloatingLinkSelectors,
} from '@udecode/plate';

const IconWrapper = styled.div`
  display: flex;
  padding-left: 8px;
  padding-right: 8px;
  align-items: center;
  color: #9ca3af;
`;

const InputWrapper = styled.div`
  display: flex;
  padding-top: 8px;
  padding-bottom: 8px;
  align-items: center;
`;

const inputCss = css`
  padding: 0;
  background-color: transparent;
  font-size: 14px;
  margin-right: 8px;
  flex-grow: 1;
  height: 32px;
  border-style: none;
  line-height: 20px;

  :focus {
    outline: none;
  }
`;

export const floatingLinkRootCss = css`
  background: white;
  z-index: 20 !important;
  border-radius: 4px;
  box-shadow: rgb(15 15 15 / 5%) 0 0 0 1px, rgb(15 15 15 / 10%) 0 3px 6px,
    rgb(15 15 15 / 20%) 0 9px 24px;
`;

const VerticalDivider = () => (
  <div
    css={css`
      margin-left: 0.5rem;
      margin-right: 0.5rem;
      background-color: #e5e7eb;
      width: 1px;
      height: 1.25rem;
    `}
  />
);

const buttonCss = css`
  display: inline-flex;
  position: relative;
  padding: 4px 10px;
  text-align: center;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  font-weight: 500;
  border-width: 0;
  cursor: pointer;
  background-color: #ffffff;

  :hover {
    background-color: #f3f4f6;
  }
  :active {
    background-color: #f3f4f6;
  }

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

const iconButtonCss = [
  plateButtonCss,
  css`
    padding: 4px;
  `,
];

export const FloatingLink = () => {
  const isEditing = useFloatingLinkSelectors().isEditing();

  const input = (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        width: 330px;
      `}
    >
      <InputWrapper>
        <IconWrapper>
          <LinkIcon width={18} />
        </IconWrapper>

        <PlateFloatingLink.UrlInput css={inputCss} placeholder="Paste link" />
      </InputWrapper>

      <div
        css={css`
          background-color: #e5e7eb;
          height: 1px;
        `}
      />

      <InputWrapper>
        <IconWrapper>
          <ShortTextIcon width={18} />
        </IconWrapper>
        <PlateFloatingLink.TextInput
          css={inputCss}
          placeholder="Text to display"
        />
      </InputWrapper>
    </div>
  );

  const editContent = !isEditing ? (
    <div
      css={css`
        display: flex;
        padding: 4px 8px;
        flex-direction: row;
        align-items: center;
        width: auto;
      `}
    >
      <PlateFloatingLink.EditButton css={buttonCss}>
        Edit
      </PlateFloatingLink.EditButton>

      <VerticalDivider />

      <PlateFloatingLink.UnlinkButton css={iconButtonCss}>
        Unlink
      </PlateFloatingLink.UnlinkButton>

      <VerticalDivider />

      <PlateFloatingLink.OpenLinkButton css={iconButtonCss}>
        Open
      </PlateFloatingLink.OpenLinkButton>
    </div>
  ) : (
    input
  );

  return (
    <>
      <PlateFloatingLink.InsertRoot css={floatingLinkRootCss}>
        {input}
      </PlateFloatingLink.InsertRoot>

      <PlateFloatingLink.EditRoot
        css={[
          floatingLinkRootCss,
          css`
            width: auto;
          `,
        ]}
      >
        {editContent}
      </PlateFloatingLink.EditRoot>
    </>
  );
};
