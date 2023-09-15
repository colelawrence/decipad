import { css } from '@emotion/react';
import {
  componentCssVars,
  cssVar,
  p13Regular,
  p14Medium,
  p14Regular,
} from '../../primitives';
import { Link as LinkIcon } from '../../icons';
import { Tooltip, Link, Badge } from '../../atoms';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useContext, useState } from 'react';
import { ClientEventsContext } from '@decipad/client-events';

const innerPopUpStyles = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '16px',
});

const groupStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const titleStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

/**
 * The styles for the parent div that wraps the copy button and the text box.
 */
const clipboardWrapperStyles = css({
  height: '32px',
  border: '1px solid',
  borderColor: cssVar('backgroundHeavy'),
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  whiteSpace: 'nowrap',
});

const copyButtonStyles = css(p13Regular, {
  height: '100%',
  backgroundColor: cssVar('backgroundHeavy'),
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  padding: '0px 8px 0px 4px',
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    svg: {
      width: '16px',
      height: '16px',
    },
  },
});

/**
 * The link text box on the right side of the copy button styles.
 */
const padLinkTextStyles = css(p13Regular, {
  userSelect: 'all',
  width: '100%',
  overflow: 'hidden',
  padding: '0px 6px',
});

const copyInnerButtonStyles = css(p13Regular, {
  fontWeight: 700,

  color: cssVar('textHeavy'),
  padding: '0px 2px',
});

/* eslint decipad/css-prop-named-variable: 0 */
interface NotebookEmbedTabProps {
  readonly isAdmin: boolean;
  readonly isPublished: boolean;
  readonly embedLink: string;
  readonly setShareMenuOpen: (open: boolean) => void;
}

export const NotebookEmbedTab = ({
  isAdmin,
  isPublished,
  embedLink,
  setShareMenuOpen,
}: NotebookEmbedTabProps) => {
  const clientEvent = useContext(ClientEventsContext);
  const [copiedPublicStatusVisible, setCopiedPublicStatusVisible] =
    useState(false);
  return (
    <div css={innerPopUpStyles}>
      {isAdmin && (
        <>
          <div css={groupStyles}>
            <div css={titleStyles}>
              <p css={css(p14Medium, { color: cssVar('textHeavy') })}>
                {isPublished ? 'Embed notebook' : 'Publish to enable embedding'}
                <Badge
                  styles={css({
                    marginLeft: 6,
                    backgroundColor: componentCssVars(
                      'ButtonPrimaryHoverBackground'
                    ),
                  })}
                >
                  beta
                </Badge>
              </p>
              <p css={css(p14Regular, { color: cssVar('textSubdued') })}>
                {isPublished ? (
                  <span css={{ marginRight: 4 }}>
                    You can embed notebook in other tools by pasting the link
                    below.
                  </span>
                ) : (
                  <span css={{ marginRight: 4 }}>
                    You can embed the notebook in other tools only after
                    publishing it.
                  </span>
                )}
                <Link
                  color="plain"
                  href="https://app.decipad.com/docs/share/embeds"
                >
                  Check out docs
                </Link>
              </p>
            </div>
          </div>
        </>
      )}

      {isPublished && (
        <div css={groupStyles}>
          <div css={clipboardWrapperStyles}>
            <div css={copyButtonStyles}>
              <Tooltip
                variant="small"
                open={copiedPublicStatusVisible}
                usePortal={false}
                trigger={
                  <div>
                    <CopyToClipboard
                      text={embedLink}
                      onCopy={() => {
                        setCopiedPublicStatusVisible(true);
                        setTimeout(() => {
                          setCopiedPublicStatusVisible(false);
                          setShareMenuOpen(false);
                        }, 1000);
                        // Analytics
                        clientEvent({
                          type: 'action',
                          action: 'notebook embed link copied',
                        });
                      }}
                    >
                      <button
                        aria-roledescription="copy url to clipboard"
                        data-testid="copy-published-link"
                        css={copyInnerButtonStyles}
                      >
                        <LinkIcon />
                        <span css={{ paddingTop: '1px' }}>Copy</span>
                      </button>
                    </CopyToClipboard>
                  </div>
                }
              >
                <p>Copied!</p>
              </Tooltip>
            </div>
            <p css={padLinkTextStyles}>
              {embedLink.replace(/https?:\/\//, '')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
