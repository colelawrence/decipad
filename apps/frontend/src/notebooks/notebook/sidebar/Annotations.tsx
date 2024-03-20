import { AnnotationsContext } from '@decipad/react-contexts';
import { tabletScreenQuery } from '@decipad/ui';
import { css } from '@emotion/react';
import { useContext } from 'react';

const containerStyles = css({
  width: '100%',
  position: 'relative',
});

const noCommentsStyles = css({
  padding: 16,
  textAlign: 'center',
  height: 'calc(100vh - 81px)',
  display: 'flex',
  alignItems: 'center',
  [tabletScreenQuery]: {
    display: 'none',
  },
});

const Annotations = () => {
  const ctx = useContext(AnnotationsContext);
  if (ctx?.annotations === undefined) {
    return null;
  }

  return (
    <div
      css={containerStyles}
      id="annotations-container"
      onClick={() => {
        ctx?.setExpandedBlockId(null);
      }}
    >
      {(!ctx || ctx.annotations.length === 0) &&
        // Hide message if user is in the process of creating the first comment.
        ctx?.expandedBlockId === null && (
          <div css={noCommentsStyles}>
            This document doesn't have any comments yet.
          </div>
        )}
    </div>
  );
};

export default Annotations;
