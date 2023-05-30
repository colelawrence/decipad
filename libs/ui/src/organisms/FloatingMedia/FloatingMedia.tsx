/* eslint decipad/css-prop-named-variable: 0 */
import {
  FloatingMedia as PlateFloatingMedia,
  LinkIcon,
  useElement,
  useFloatingMediaSelectors,
} from '@udecode/plate';
import { css } from '@emotion/react';
import {
  floatingButtonCss,
  floatingInputCss,
  floatingRootCss,
  floatingRowCss,
  plateButtonCss,
} from '../../styles/floating';
import {
  FloatingIconWrapper,
  FloatingInputWrapper,
  FloatingVerticalDivider,
  RemoveNodeButton,
} from '../../atoms';

export const FloatingMedia = ({ pluginKey }: { pluginKey?: string }) => {
  const isEditing = useFloatingMediaSelectors().isEditing();
  const element = useElement();

  return (
    <div css={floatingRootCss}>
      {!isEditing ? (
        <div css={floatingRowCss}>
          <PlateFloatingMedia.EditButton css={plateButtonCss}>
            Edit link
          </PlateFloatingMedia.EditButton>

          <FloatingVerticalDivider />

          <RemoveNodeButton element={element} css={floatingButtonCss} />
        </div>
      ) : (
        <div
          css={css`
            display: flex;
            flex-direction: column;
            width: 330px;
          `}
        >
          <FloatingInputWrapper>
            <FloatingIconWrapper>
              <LinkIcon width={18} />
            </FloatingIconWrapper>

            <PlateFloatingMedia.UrlInput
              css={floatingInputCss}
              placeholder="Paste the embed link..."
              pluginKey={pluginKey}
            />
          </FloatingInputWrapper>
        </div>
      )}
    </div>
  );
};
