import { css, Global } from '@emotion/react';
import Tippy from '@tippyjs/react';
import { FC } from 'react';

import tippyStyles from 'tippy.js/dist/tippy.css?raw';

import { black, p12Bold, p12Regular, setCssVar, white } from '../../primitives';

const deciThemeName = 'deci';
const tippyDeciThemeStyles = css`
  .tippy-box[data-theme~='${deciThemeName}'] {
    background-color: ${black.rgb};
    font-weight: 600;
    padding: 6px;
  }
  .tippy-box[data-theme~='${deciThemeName}'][data-placement^='top']
    > .tippy-arrow:before {
    border-top-color: ${black.rgb};
  }
  .tippy-box[data-theme~='${deciThemeName}'][data-placement^='bottom']
    > .tippy-arrow:before {
    border-bottom-color: ${black.rgb};
  }
  .tippy-box[data-theme~='${deciThemeName}'][data-placement^='left']
    > .tippy-arrow:before {
    border-left-color: ${black.rgb};
  }
  .tippy-box[data-theme~='${deciThemeName}'][data-placement^='right']
    > .tippy-arrow:before {
    border-right-color: ${black.rgb};
  }
  .tippy-box[data-theme~='${deciThemeName}'] > .tippy-backdrop {
    background-color: ${black.rgb};
  }
  .tippy-box[data-theme~='${deciThemeName}'] > .tippy-svg-arrow {
    fill: ${black.rgb};
  }
`;

/**
 * The Tooltip's container styles, it aligns all text in the center.
 */
const tooltipContentStyles = css({
  textAlign: 'center',
});

/**
 * The user name element styles, it changes the default black color of p12Bold to white.
 */
const userNameStyles = css(p12Bold, setCssVar('currentTextColor', white.rgb));

/**
 * The user permission element styles.
 */
const permissionStyles = css(
  p12Regular,
  setCssVar('currentTextColor', white.rgb),
  {
    opacity: 0.5,
    marginTop: '3px',
  }
);

export interface NotebookTopbarTooltipProps {
  children: JSX.Element;
  name: string;
  permission: string;
  visible?: boolean;
}

/**
 * This component renders a tooltip on it's children with the deci theme.
 * @param {string} name - The name of the user.
 * @param {string} permission - The user's current permission to the pad.
 * @param {JSX} children - React component to render the avatars.
 * @param {boolean} visible - initially render the tooltip or not, useful in testing.
 */
export const NotebookTopbarTooltip = ({
  children,
  name,
  permission,
  visible = undefined,
}: NotebookTopbarTooltipProps): ReturnType<FC> => {
  return (
    <div css={tippyDeciThemeStyles}>
      <Global styles={tippyStyles} />
      <Tippy
        key={name}
        theme={deciThemeName}
        visible={visible}
        content={
          <div css={tooltipContentStyles}>
            <h2 css={userNameStyles}>{name}</h2>
            <p css={permissionStyles}>{permission}</p>
          </div>
        }
      >
        {children}
      </Tippy>
    </div>
  );
};
