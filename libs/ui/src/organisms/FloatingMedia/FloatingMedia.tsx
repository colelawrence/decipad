import { atoms } from '@decipad/ui';
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

          <atoms.FloatingVerticalDivider />

          <atoms.RemoveNodeButton element={element} css={floatingButtonCss} />
        </div>
      ) : (
        <div
          css={css`
            display: flex;
            flex-direction: column;
            width: 330px;
          `}
        >
          <atoms.FloatingInputWrapper>
            <atoms.FloatingIconWrapper>
              <LinkIcon width={18} />
            </atoms.FloatingIconWrapper>

            <PlateFloatingMedia.UrlInput
              css={floatingInputCss}
              placeholder="Paste the embed link..."
              pluginKey={pluginKey}
            />
          </atoms.FloatingInputWrapper>
        </div>
      )}
    </div>
  );
};
